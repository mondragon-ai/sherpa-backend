import {
  createRootDocument,
  fetchRootDocument,
  fetchSubcollectionDocument,
  updateRootDocument,
  updateSubcollectionDocument,
} from "../../../database/firestore";
import {
  createEmailPayload,
  updateExistingEmailConversation,
} from "../../../lib/payloads/emails";
import {gmail_v1, google} from "googleapis";
import * as functions from "firebase-functions";
import {Status} from "../../../lib/types/shared";
import {createResponse} from "../../../util/errors";
import {EmailDocument} from "../../../lib/types/emails";
import {getEmailFromHistory} from "../../../pubsub/gmail";
import {GmailTokenData} from "../../../lib/types/gmail/auth";
import {GmailWatchResponse} from "../../../lib/types/gmail/email";
import {classifyMessage} from "../../../lib/helpers/agents/classify";
import {updateMerchantUsage} from "../../../networking/shopify/billing";
import {DomainMap, MerchantDocument} from "../../../lib/types/merchant";
import {validateEmailIsCustomer} from "../../../networking/openAi/respond";
import {fetchCustomerDataFromEmail} from "../../../lib/helpers/emails/emails";
import {getValidGmailAccessToken} from "../../../lib/helpers/emails/validate";
import {getCurrentUnixTimeStampFromTimezone} from "../../../util/formatters/time";
import {ChatDocument} from "../../../lib/types/chats";
import {emailSignature} from "../../../lib/prompts/emails/signature";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export const initiateAuth = async (domain: string) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state: domain,
    prompt: "consent",
  });

  return {status: 200, message: "success", data: url};
};

export const gmailCallback = async (domain: string, code: string) => {
  try {
    const {tokens} = await oAuth2Client.getToken(code as string);
    return await saveToken(tokens as GmailTokenData, domain);
  } catch (error) {
    console.error(error);
    return createResponse(500, "error generating tokens", null);
  }
};

export const saveToken = async (
  token: GmailTokenData,
  domain: string,
): Promise<{
  status: Status;
  message: string;
  data: null;
}> => {
  let id = domain;
  const {data} = await fetchRootDocument("shopify_merchant", domain);
  let merchant = data as MerchantDocument;

  if (!merchant) {
    const {data: map} = await fetchRootDocument("domain_map", domain);
    const domain_map = map as DomainMap;
    const {data: doc} = await fetchRootDocument(
      "shopify_merchant",
      domain_map.myshopify_domain,
    );
    if (!doc) return createResponse(400, "Merchant Not Found", null);
    merchant = doc as MerchantDocument;
    id = domain_map.myshopify_domain;
  }

  merchant.updated_at = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  merchant.apps = [
    ...merchant.apps,
    {
      name: "gmail",
      time: token.expiry_date,
      token: token.access_token,
      refresh_token: token.refresh_token,
      connected: true,
      email: "",
    },
  ];
  await updateRootDocument("shopify_merchant", id, merchant);

  const request = {
    userId: "me",
    requestBody: {
      topicName: "projects/sherpa-dc1fe/topics/gmail-messages",
      labelIds: ["INBOX"],
      labelFilterBehavior: "INCLUDE",
    },
  };

  const access_token = await getValidGmailAccessToken(merchant);
  if (!access_token) return createResponse(401, "No Token", null);

  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({access_token: access_token});
  const gmail = google.gmail({version: "v1", auth: oAuth2Client});

  const response = (await gmail.users.watch(request)) as GmailWatchResponse;
  if (response.status > 300) {
    return createResponse(response.status as Status, response.statusText, null);
  }

  return await mapEmailToDB(gmail, merchant);
};

export const sendGmailEmail = async (
  domain: string,
  to: string,
  subject: string,
  message: string,
  type: "email" | "chat",
) => {
  if (!domain || !to || !message) {
    return createResponse(400, "Missing params", null);
  }

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "Merchant Not Found", null);

  const token = await getValidGmailAccessToken(merchant);
  if (!token) return createResponse(401, "No Token", null);

  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({access_token: token});
  const gmail = google.gmail({version: "v1", auth: oAuth2Client});

  // const email = [
  //   `To: ${to}`,
  //   "Content-Type: text/html; charset=utf-8",
  //   "MIME-Version: 1.0",
  //   `Subject: ${subject}`,
  //   "Content-Transfer-Encoding: base64",
  //   "",
  //   message,
  // ].join("\n");

  const signature = emailSignature(merchant);
  const email =
    "From: 'me'\r\n" +
    "To: " +
    to +
    "\r\n" +
    "Subject: " +
    subject +
    "\r\n" +
    "Content-Type: text/html; charset='UTF-8'\r\n" +
    "Content-Transfer-Encoding: base64\r\n\r\n" +
    "<html>" +
    `<head>
        <style>
          .parentWrapper {
            width: 100%;
            padding: 3rem 0;
            margin: 0;
            background: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .container {
            width: 50%;
            padding: 3rem;
            margin: 0 auto;
            background: #faf7f4;
            border-radius: 10px;
            box-shadow: 0px 0px 10px 1px #e4e4e4;
          }
          h5, h6, p, a, span, strong {
            font-family: sans-serif;
            color: #333;
          }
          h5 { font-size: 20px; font-weight: 500; line-height: 1.1; }
          h6 { font-size: 13px; font-weight: 500; margin: 0 0 10px; }
          p { font-size: 13px; line-height: 18px; }
          a, span { font-size: 12px; line-height: 18px; }
          .signature {
            width: 100%;
            height: auto;
            padding: 0rem 0;
            margin: 0;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            display: flex;
          }
          .logoWrapper {
            width: 15%;
            height: auto;
            padding: 2rem;
            margin: 0;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
          }
          .logoWrapper img {
            width: 100%;
            height: auto;
            border-radius: 10px;
            object-fit: contain;
          }
          .dividerWrapper {
            width: 2px;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            margin-right: 10px;
          }
          .dividerWrapper > div {
            width: 1px;
            height: 90%;
            background-color: rgb(218, 218, 218);
          }
          .socialWrapper {
            width: 100%;
            height: auto;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            margin: 0;
            padding: 10px 0;
          }
          .socialWrapper > a {
            width: 25px;
            height: 25px;
            border-radius: 4px;
            margin-right: 5px;
          }
          .socialWrapper > a > img {
            object-fit: contain;
            width: 25px;
            height: 25px;
          }
          @media screen and (max-width: 480px) {
            .container {
              width: 80%;
              padding: 1rem;
            }
            .signature {
              display: block;
            }
            .logoWrapper {
              width: 25%;
              padding: 10px;
              padding-left: 0;
            }
            .dividerWrapper {
              width: 100% !important;
              height: 2px;
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              align-items: flex-start;
              margin: 10px 0;
            }
            .dividerWrapper > div {
              width: 50%;
              height: 1px;
              background-color: rgb(218, 218, 218);
            }
          }
        </style>
    </head>` +
    "<body>" +
    "<div class='parentWrapper'>" +
    "<div class='container'>" +
    message +
    signature +
    "<br />" +
    "</div>" +
    "</div>" +
    "</body></html>";

  const encodedEmail = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedEmail,
    },
  });

  if (response.status > 300) {
    return createResponse(response.status as Status, "Couldn't Send", null);
  }

  const sub_collection = type == "chat" ? "chats" : "emails";

  const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  await updateSubcollectionDocument(
    "shopify_merchant",
    domain,
    sub_collection,
    to,
    {email_sent: true, updated_at: time} as ChatDocument,
  );

  return createResponse(response.status as Status, "Email Sent", {
    email: response.data,
  });
};

export const fetchEmails = async (domain: string, seconds: string) => {
  if (!domain) return createResponse(400, "Missing Domain", null);

  // const {data} = await fetchRootDocument("shopify_merchant", domain);
  // const merchant = data as MerchantDocument;
  // if (!merchant) return createResponse(422, "Merchant Not Found", null);

  // const access_token = await getValidGmailAccessToken(merchant);
  // if (!access_token) return createResponse(401, "No Token", null);
  // console.log({access_token});

  // const oAuth2Client = new google.auth.OAuth2();
  // oAuth2Client.setCredentials({access_token: access_token});
  // const gmail = google.gmail({version: "v1", auth: oAuth2Client});

  // const res = await gmail.users.messages.list({
  //   userId: "me",
  //   maxResults: 100,
  //   q: `after:${seconds}`,
  // });
  // const messages = res.data.messages || [];

  // const emails = (await Promise.all(
  //   messages.map(async (msg) => {
  //     const message = await gmail.users.messages.get({
  //       userId: "me",
  //       id: msg.id || "",
  //     });
  //     return message.data;
  //   }),
  // )) as EmailFetchResponseData[];

  // const cleaned_emails = await cleanEmailFromGmail(emails, merchant);
  // console.log(cleaned_emails);

  return createResponse(200, "Fetched email", {emails: null});
};

export const subscribeToGmail = async (domain: string) => {
  if (!domain) return createResponse(400, "Missing Domain", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "Merchant Not Found", null);

  const request = {
    userId: "me",
    requestBody: {
      topicName: "projects/sherpa-dc1fe/topics/gmail-messages",
      labelIds: ["INBOX"],
      labelFilterBehavior: "INCLUDE",
    },
  };

  const access_token = await getValidGmailAccessToken(merchant);
  if (!access_token) return createResponse(401, "No Token", null);

  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({access_token: access_token});
  const gmail = google.gmail({version: "v1", auth: oAuth2Client});

  const response = (await gmail.users.watch(request)) as GmailWatchResponse;
  if (response.status > 300) {
    return createResponse(response.status as Status, response.statusText, null);
  }

  return await mapEmailToDB(gmail, merchant);
};

const mapEmailToDB = async (
  gmail: gmail_v1.Gmail,
  merchant: MerchantDocument,
) => {
  const profile = await gmail.users.getProfile({userId: "me"});
  const sender = profile.data.emailAddress;
  if (!sender) {
    return createResponse(profile.status as Status, profile.statusText, null);
  }

  const payload = {
    id: sender,
    domain: merchant.id,
  };

  await createRootDocument("email_map", sender, payload);

  return createResponse(201, "Subscribed", {sender});
};

export const testSubPub = async (domain: string, email: string, id: number) => {
  if (!domain) return createResponse(400, "Missing Domain", null);

  // Fetch Merchant
  const {data: m} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = m as MerchantDocument;
  if (!merchant) return createResponse(422, "No Merchant", null);

  // Validate Token
  const access_token = await getValidGmailAccessToken(merchant);
  if (!access_token) return createResponse(401, "Invalid", null);

  const data = {
    emailAddress: email,
    historyId: id,
  };

  // Fetch Email from History
  const cleaned = await getEmailFromHistory(data, access_token, merchant);
  if (!cleaned) return createResponse(400, "Can't Clean", null);

  // Update Merchant Usage
  const response = await updateMerchantUsage(domain, merchant);
  if (response.capped || !response.charged) {
    return createResponse(429, "Could not charge merchant", null);
  }

  const msg = `**Subject**:<br> ${
    cleaned[0].subject
  }<br><br> **Message**:<br> ${cleaned[0].content.join(" ")} `;
  functions.logger.info({cleaned: cleaned[0]});

  const is_email = await validateEmailIsCustomer(msg);
  if (!is_email || is_email.includes("invalid")) {
    return createResponse(409, "Invalid Email", {is_email});
  }

  // Fetch (if exists) Email thread
  const {data: doc} = await fetchSubcollectionDocument(
    "shopify_merchant",
    domain,
    "emails",
    cleaned[0].from,
  );

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
  const {email: payload} = await createEmailPayload(
    merchant,
    existing_email,
    customer,
    (order && order[0]) || null,
    cleaned[0],
    msg,
  );
  if (!payload) return createResponse(400, "Couldn't Respond", null);

  // Update/Save
  const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  payload.classification = classification;
  payload.updated_at = time;
  const save = await updateSubcollectionDocument(
    "shopify_merchant",
    domain,
    "emails",
    cleaned[0].from,
    payload,
  );
  return createResponse(save.status, "Success", payload);
};

export const removeGmail = async (domain: string) => {
  if (!domain) return createResponse(400, "Missing Domain", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;

  merchant.updated_at = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  const apps = merchant.apps.filter((a) => a.name !== "gmail");
  merchant.apps = apps;
  await updateRootDocument("shopify_merchant", merchant.id, merchant);

  return createResponse(200, "Removed Recharge", null);
};
