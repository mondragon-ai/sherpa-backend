import {
  fetchRootDocument,
  fetchSubcollectionDocument,
  updateSubcollectionDocument,
} from "../database/firestore";
import {
  CleanedEmail,
  EmailFetchResponseData,
  GmailNotifications,
} from "../lib/types/gmail/email";
import {
  createEmailPayload,
  updateExistingEmailConversation,
} from "../lib/payloads/emails";
import {gmail_v1, google} from "googleapis";
import {createResponse} from "../util/errors";
import * as functions from "firebase-functions";
import {MerchantDocument} from "../lib/types/merchant";
import {EmailDocument, EmailMap} from "../lib/types/emails";
import {classifyMessage} from "../lib/helpers/agents/classify";
import {cleanEmailFromGmail} from "../lib/payloads/gmail/emails";
import {updateMerchantUsage} from "../networking/shopify/billing";
import {cleanEmailFromHtml} from "../networking/openAi/cleanEmail";
import {validateEmailIsCustomer} from "../networking/openAi/respond";
import {getValidGmailAccessToken} from "../lib/helpers/emails/validate";
import {fetchCustomerDataFromEmail} from "../lib/helpers/emails/emails";
import {getCurrentUnixTimeStampFromTimezone} from "../util/formatters/time";

const settings: functions.RuntimeOptions = {
  timeoutSeconds: 120,
};

// avg price = $0.0045
export const receiveGmailNotification = functions
  .runWith(settings)
  .pubsub.topic("gmail-messages")
  .onPublish(async (message) => {
    const data = (await message.json) as unknown as GmailNotifications;

    const email = data.emailAddress;
    if (!email) return;

    const {data: map_doc} = await fetchRootDocument("email_map", email);
    const map = map_doc as EmailMap;
    if (!map) return;

    const {data: m} = await fetchRootDocument("shopify_merchant", map.domain);
    const merchant = m as MerchantDocument;
    if (!merchant) return;

    const access_token = await getValidGmailAccessToken(merchant);
    if (!access_token) return;

    const {id: domain} = merchant;

    // Fetch Email from History
    const scrubbed = await getEmailFromHistory(data, access_token, merchant);
    if (!scrubbed) return createResponse(400, "Can't Clean", null);

    const cleaned = await cleanEmailFromHtml(scrubbed[0].content.join(" "));

    const msg = `**Subject**:<br> ${scrubbed[0].subject}<br><br> **Message**:<br> ${cleaned} `;
    // functions.logger.info({scrubbed: cleaned});

    const is_email = await validateEmailIsCustomer(msg);
    if (!is_email || is_email.includes("invalid")) {
      return createResponse(409, "Invalid Email", {is_email});
    }

    // Update Merchant Usage
    const response = await updateMerchantUsage(domain, merchant);
    if (response.capped || !response.charged) {
      return createResponse(429, "Could not charge merchant", null);
    }

    // Fetch (if exists) Email thread
    const {data: doc} = await fetchSubcollectionDocument(
      "shopify_merchant",
      domain,
      "emails",
      scrubbed[0].from,
    );

    const existing_email = doc as EmailDocument;
    if (existing_email && existing_email.status == "open") {
      const last =
        existing_email.conversation[existing_email.conversation.length - 1];
      console.log({last: last.history_id, scrubbed: scrubbed[0].historyId});

      if (last.history_id == scrubbed[0].historyId) {
        return createResponse(409, "Repeat", null);
      }
      await updateExistingEmailConversation(
        existing_email,
        msg,
        scrubbed[0],
        merchant,
      );
      return createResponse(201, "Still Open", null);
    }

    // Classify message
    const classification = await classifyMessage(existing_email, msg);

    // Extract Order Number & Customer Data
    const {order, customer} = await fetchCustomerDataFromEmail(
      merchant,
      msg,
      scrubbed[0].from,
    );

    if (scrubbed[0].from && order && order[0] && order[0].email !== "") {
      if (order[0].email !== scrubbed[0].from) {
        return createResponse(409, "Email Must Match", {chat: null});
      }
    }

    // Create payload
    const {email: payload} = await createEmailPayload(
      merchant,
      existing_email,
      customer,
      (order && order[0]) || null,
      scrubbed[0],
      msg,
    );
    if (!payload) return createResponse(400, "Couldn't Respond", null);
    // functions.logger.info({payload});

    // Update/Save
    const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
    payload.classification = classification;
    payload.updated_at = time;

    const save = await updateSubcollectionDocument(
      "shopify_merchant",
      domain,
      "emails",
      scrubbed[0].from,
      payload,
    );

    return createResponse(save.status, "Success", payload);
  });

export const getEmailFromHistory = async (
  data: GmailNotifications,
  token: string,
  merchant: MerchantDocument,
) => {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({access_token: token});
  const gmail = google.gmail({version: "v1", auth: oAuth2Client});

  const profile = await gmail.users.getProfile({userId: "me"});
  const sender = profile.data.emailAddress;
  if (data.emailAddress == sender) return null;

  const profileResponse = await gmail.users.getProfile({userId: "me"});
  const history_id = profileResponse.data.historyId;

  try {
    const history = await getHistoryFromID(gmail, history_id || "");
    if (!history || !history.data.history) {
      const messaage = await getMessagesFromData(gmail, merchant);
      if (!messaage) return null;

      return messaage;
    }

    return await handleCleaningHistory(history.data.history, gmail, merchant);
  } catch (error: any) {
    return handleCatchGmail(error.code);
  }
};

export const handleCatchGmail = (status: number) => {
  if (status === 404) {
    console.error("The specified history ID was not found: 404");
  } else if (status === 401) {
    console.error("Access token may be invalid or expired.");
  } else {
    console.error("Error fetching Gmail history: else");
  }
  return null;
};

export const handleCleaningHistory = async (
  history: gmail_v1.Schema$History[],
  gmail: gmail_v1.Gmail,
  merchant: MerchantDocument,
) => {
  const cleaned_emails: CleanedEmail[] = [];
  for (const item of history) {
    if (item.messages) {
      for (const msg of item.messages) {
        try {
          const fullMessage = await gmail.users.messages.get({
            userId: "me",
            id: msg.id || "",
          });

          if (fullMessage.data) {
            const cleanedEmail = await cleanEmailFromGmail(
              [fullMessage.data as EmailFetchResponseData],
              merchant,
              msg.id || "",
              gmail,
            );
            cleaned_emails.push(...cleanedEmail);
          }
        } catch (error: any) {
          return handleCatchGmail(error.code);
        }
      }
    }
  }
  return cleaned_emails;
};

export const getHistoryFromID = async (
  gmail: gmail_v1.Gmail,
  history_id: string,
) => {
  const history = await gmail.users.history.list({
    userId: "me",
    startHistoryId: String(history_id),
  });

  if (!history.data.history) {
    console.warn("No history found for the provided historyId: ", history_id);
    return null;
  }

  return history;
};

export const getMessagesFromData = async (
  gmail: gmail_v1.Gmail,
  merchant: MerchantDocument,
) => {
  const messages = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX"],
    q: "is:unread",
    maxResults: 1,
  });

  const cleaned_emails: CleanedEmail[] = [];
  if (messages.data.messages && messages.data.messages.length > 0) {
    const msg = messages.data.messages[0];
    const message = await gmail.users.messages.get({
      userId: "me",
      id: msg.id || "",
    });

    try {
      if (message.data) {
        const cleanedEmail = await cleanEmailFromGmail(
          [message.data as EmailFetchResponseData],
          merchant,
          msg.id || "",
          gmail,
        );

        cleaned_emails.push(...cleanedEmail);
      }
    } catch (error: any) {
      return handleCatchGmail(error.code);
    }
  }
  return cleaned_emails;
};
