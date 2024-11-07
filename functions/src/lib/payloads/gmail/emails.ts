import {
  decodeFromBase64,
  extractEmailFromString,
} from "../../../util/formatters/text";
import {MerchantDocument} from "../../types/merchant";
import {CleanedEmail, EmailFetchResponseData} from "../../types/gmail/email";
import {getCurrentUnixTimeStampFromTimezone} from "../../../util/formatters/time";
import {gmail_v1} from "googleapis";

export const cleanEmailFromGmail = async (
  list: EmailFetchResponseData[],
  merchant: MerchantDocument,
  messageId: string,
  gmailClient: gmail_v1.Gmail,
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
        if (part.body.attachmentId) {
          const img_data = await getAttachment(
            part.body?.attachmentId,
            messageId,
            gmailClient,
          );

          if (img_data.data.data) {
            attatchments.push({
              id: part.body.attachmentId || "",
              data: img_data.data.data,
              mime: part.mimeType,
            });
          }
        }
      }
    }

    if (body.length == 0) {
      for (const part of email.payload.parts) {
        if (part.mimeType == "multipart/alternative" && part.parts) {
          for (const child of part.parts) {
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

export const getAttachment = async (
  attachmentId: string,
  messageId: string,
  gmailClient: gmail_v1.Gmail,
) => {
  const response = await gmailClient.users.messages.attachments.get({
    id: attachmentId,
    messageId,
    userId: "me",
  });
  return response;
};
