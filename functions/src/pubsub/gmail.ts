import {google} from "googleapis";
import {EmailMap} from "../lib/types/emails";
import * as functions from "firebase-functions";
import {MerchantDocument} from "../lib/types/merchant";
import {fetchRootDocument} from "../database/firestore";
import {
  CleanedEmail,
  EmailFetchResponseData,
  GmailNotifications,
} from "../lib/types/gmail/email";
import {getValidGmailAccessToken} from "../lib/helpers/emails/validate";
import {cleanEmailFromGmail} from "../lib/payloads/gmail/emails";

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

    const {data: doc} = await fetchRootDocument("email_map", email);
    const map = doc as EmailMap;
    if (!map) return;

    const {data: m} = await fetchRootDocument("shopify_merchant", map.domain);
    const merchant = m as MerchantDocument;
    if (!merchant) return;

    const access_token = await getValidGmailAccessToken(merchant);
    if (!access_token) return;

    const cleaned = await getEmailFromHistory(data, access_token, merchant);
    if (!cleaned) return;
  });

const getEmailFromHistory = async (
  data: GmailNotifications,
  token: string,
  merchant: MerchantDocument,
) => {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({access_token: token});
  const gmail = google.gmail({version: "v1", auth: oAuth2Client});

  const hitory_id = data.historyId;
  const history = await gmail.users.history.list({
    userId: "me",
    startHistoryId: String(hitory_id),
  });

  let cleaned_email: CleanedEmail[] | null = null;
  if (history.data.history) {
    for (const item of history.data.history) {
      if (item.messages) {
        for (const msg of item.messages) {
          const full_message = await gmail.users.messages.get({
            userId: "me",
            id: msg.id || "",
          });

          if (full_message.data) {
            functions.logger.info({msg: full_message.data});
            cleaned_email = cleanEmailFromGmail(
              [full_message.data as EmailFetchResponseData],
              merchant,
            );
            console.log("New email content:", cleaned_email);
          }
        }
      }
    }
  }
  return cleaned_email;
};
