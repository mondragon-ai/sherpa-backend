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
  respondToEmailPayload,
  updateExistingEmailConversation,
} from "../lib/payloads/emails";
import {google} from "googleapis";
import {createResponse} from "../util/errors";
import * as functions from "firebase-functions";
import {MerchantDocument} from "../lib/types/merchant";
import {EmailDocument, EmailMap} from "../lib/types/emails";
import {classifyMessage} from "../lib/helpers/agents/classify";
import {cleanEmailFromGmail} from "../lib/payloads/gmail/emails";
import {updateMerchantUsage} from "../networking/shopify/billing";
import {validateEmailIsCustomer} from "../networking/openAi/respond";
import {getValidGmailAccessToken} from "../lib/helpers/emails/validate";
import {fetchCustomerDataFromEmail} from "../lib/helpers/emails/emails";

const settings: functions.RuntimeOptions = {
  timeoutSeconds: 120,
};

export const receiveGmailNotification = functions
  .runWith(settings)
  .pubsub.topic("gmail-messages")
  .onPublish(async (message) => {
    const data = (await message.json) as unknown as GmailNotifications;
    console.log({data});

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
    const cleaned = await getEmailFromHistory(data, access_token, merchant);
    if (!cleaned) return createResponse(400, "Can't Clean", null);

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
      cleaned[0].from,
    );

    const msg = `**Subject**:<br> ${
      cleaned[0].subject
    }<br><br> **Message**:<br> ${cleaned[0].content.join(" ")} `;
    functions.logger.info({cleaned: cleaned[0]});

    const is_email = await validateEmailIsCustomer(msg);
    if (!is_email || is_email.includes("invalid")) {
      return createResponse(409, "Invalid Email", {is_email});
    }

    const existing_email = doc as EmailDocument;
    if (existing_email && existing_email.status == "open") {
      await updateExistingEmailConversation(
        existing_email,
        msg,
        cleaned[0],
        merchant,
      );
      return createResponse(201, "Still Open", null);
    }

    // Classify message
    const classification = await classifyMessage(existing_email, msg);
    console.log({classification});

    // Extract Order Number & Customer Data
    const {order, customer} = await fetchCustomerDataFromEmail(
      merchant,
      msg,
      cleaned[0].from,
    );

    if (customer?.email && order && order[0] && order[0].email !== "") {
      if (order[0].email !== email) {
        return createResponse(409, "Email Must Match", {chat: null});
      }
    }

    // Create payload
    const {email: email_payload} = createEmailPayload(
      merchant,
      existing_email,
      customer,
      (order && order[0]) || null,
      cleaned[0],
      msg,
    );

    const payload = respondToEmailPayload(
      email_payload,
      merchant.timezone,
      classification,
    );
    if (!payload) return createResponse(400, "Couldn't Respond", null);

    // Update/Save
    const save = await updateSubcollectionDocument(
      "shopify_merchant",
      domain,
      "emails",
      cleaned[0].from,
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
  const hitory_id = data.historyId;

  try {
    const history = await gmail.users.history.list({
      userId: "me",
      startHistoryId: String(hitory_id),
    });

    if (!history.data.history) {
      console.error(history.data);
      console.warn("No history found for the provided historyId.");
      return null;
    }

    const cleanedEmails: CleanedEmail[] = [];
    for (const item of history.data.history) {
      if (item.messages) {
        for (const msg of item.messages) {
          try {
            const fullMessage = await gmail.users.messages.get({
              userId: "me",
              id: msg.id || "",
            });

            if (fullMessage.data) {
              const cleanedEmail = cleanEmailFromGmail(
                [fullMessage.data as EmailFetchResponseData],
                merchant,
              );
              cleanedEmails.push(...cleanedEmail);
            }
          } catch (messageError: any) {
            if (messageError.code === 404) {
              console.error(`Email message with ID ${msg.id} was not found.`);
            } else {
              console.error(
                `Error fetching message ID ${msg.id}:`,
                messageError.message,
              );
            }
          }
        }
      }
    }
    return cleanedEmails;
  } catch (historyError: any) {
    if (historyError.code === 404) {
      console.error(
        "The specified history ID was not found:",
        historyError.message,
      );
    } else if (historyError.code === 401) {
      console.error(
        "Authorization error - access token may be invalid or expired.",
      );
    } else {
      console.error("Error fetching Gmail history:", historyError.message);
    }
    return null;
  }
};
