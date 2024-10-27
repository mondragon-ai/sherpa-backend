import {
  decodeFromBase64,
  extractEmailFromString,
} from "../../../util/formatters/text";
import {getCurrentUnixTimeStampFromTimezone} from "../../../util/formatters/time";
import {EmailDocument} from "../../types/emails";
import {CleanedEmail, EmailFetchResponseData} from "../../types/gmail/email";
import {MerchantDocument} from "../../types/merchant";

export const cleanEmailFromGmail = (
  list: EmailFetchResponseData[],
  merchant: MerchantDocument,
) => {
  const emails = [] as CleanedEmail[];

  for (const email of list) {
    const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
    const body = [];
    const attatchments = [];
    for (const part of email.payload.parts) {
      if (part.mimeType == "text/plain") {
        body.push(decodeFromBase64(part.body.data || ""));
      }
      if (part.mimeType.includes("image") || part.mimeType.includes("pdf")) {
        attatchments.push(part.body.attachmentId || "");
      }
    }

    if (body.length == 0) {
      for (const part of email.payload.parts) {
        console.log({Parent_Part: part.mimeType});
        if (part.mimeType == "multipart/alternative" && part.parts) {
          for (const child of part.parts) {
            console.log({Child_Part: child.mimeType});
            if (child.mimeType == "text/plain") {
              body.push(decodeFromBase64(child.body.data || ""));
            }
          }
        }
      }
    }
    const from =
      email.payload.headers.find((header) => header.name === "From")?.value ||
      "";
    const subject =
      email.payload.headers.find((header) => header.name === "Subject")
        ?.value || "";

    emails.push({
      id: email.id,
      threadId: email.threadId,
      historyId: email.historyId,
      snippet: email.snippet,
      internalDate: email.internalDate, // Miliseconds
      from: extractEmailFromString(from),
      subject: subject,
      content: body,
      attachments: attatchments,
      created_at: time,
    });
  }
  return emails;
};

export const buildEmailPayload = (
  merchant: MerchantDocument,
): EmailDocument => {
  const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  return {
    specific_issue: "",
    edited: false,
    suggested_email: "",
    email_sent: false,
    manual: false,
    manually_triggerd: false,
    initial_message: "",
    convo_trained: false,
    action_trained: false,
    rating: null,
    classification: null,
    issue: "general",
    suggested_action_done: false,
    summary: "",
    error_info: "",
    timezone: "",
    domain: "",
    id: "",
    conversation: [],
    time: time,
    status: "open",
    suggested_action: null,
    customer: null,
    email: null,
    updated_at: time,
    created_at: time,
    order: null,
    source: "gmail",
    history_id: "",
    thread: [],
  };
};
