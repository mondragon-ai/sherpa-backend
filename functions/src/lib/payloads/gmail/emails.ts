import {
  decodeFromBase64,
  extractEmailFromString,
} from "../../../util/formatters/text";
import {MerchantDocument} from "../../types/merchant";
import {CleanedEmail, EmailFetchResponseData} from "../../types/gmail/email";
import {getCurrentUnixTimeStampFromTimezone} from "../../../util/formatters/time";

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
        attatchments.push({
          id: part.body.attachmentId || "",
          data: part.body.data || "",
          mime: part.mimeType,
        });
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
