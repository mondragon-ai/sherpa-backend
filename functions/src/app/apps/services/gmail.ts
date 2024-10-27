import {
  createRootDocument,
  fetchRootDocument,
  updateRootDocument,
} from "../../../database/firestore";
import {
  EmailFetchResponseData,
  GmailWatchResponse,
} from "../../../lib/types/gmail/email";
import {gmail_v1, google} from "googleapis";
import {Status} from "../../../lib/types/shared";
import {createResponse} from "../../../util/errors";
import {GmailTokenData} from "../../../lib/types/gmail/auth";
import {cleanEmailFromGmail} from "../../../lib/payloads/gmail/emails";
import {DomainMap, MerchantDocument} from "../../../lib/types/merchant";
import {getValidGmailAccessToken} from "../../../lib/helpers/emails/validate";
import {getCurrentUnixTimeStampFromTimezone} from "../../../util/formatters/time";
import {getEmailFromHistory} from "../../../pubsub/gmail";

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

export const sendEmail = async (
  domain: string,
  to: string,
  subject: string,
  message: string,
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

  const email = [
    `To: ${to}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    message,
  ].join("\n");

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

  return createResponse(response.status as Status, response.statusText, {
    email: response.data,
  });
};

export const fetchEmails = async (domain: string, seconds: string) => {
  if (!domain) return createResponse(400, "Missing Domain", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "Merchant Not Found", null);

  const access_token = await getValidGmailAccessToken(merchant);
  if (!access_token) return createResponse(401, "No Token", null);
  console.log({access_token});

  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({access_token: access_token});
  const gmail = google.gmail({version: "v1", auth: oAuth2Client});

  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: 100,
    q: `after:${seconds}`,
  });
  const messages = res.data.messages || [];

  const emails = (await Promise.all(
    messages.map(async (msg) => {
      const message = await gmail.users.messages.get({
        userId: "me",
        id: msg.id || "",
      });
      return message.data;
    }),
  )) as EmailFetchResponseData[];

  const cleaned_emails = cleanEmailFromGmail(emails, merchant);
  console.log(cleaned_emails);

  return createResponse(200, "Fetched email", {emails: cleaned_emails});
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

  const {data: m} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = m as MerchantDocument;
  if (!merchant) return createResponse(422, "No Merchant", null);

  const access_token = await getValidGmailAccessToken(merchant);
  if (!access_token) return createResponse(401, "Invalid", null);

  const data = {
    emailAddress: email,
    historyId: id,
  };

  const cleaned = await getEmailFromHistory(data, access_token, merchant);
  if (!cleaned) return createResponse(400, "Can't Clean", null);

  return createResponse(200, "Success", null);
};
