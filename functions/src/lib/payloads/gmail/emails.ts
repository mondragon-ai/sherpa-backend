import {getCurrentUnixTimeStampFromTimezone} from "../../../util/formatters/time";
import {EmailDocument} from "../../types/emails";
import {EmailFetchResponseData} from "../../types/gmail/email";
import {MerchantDocument} from "../../types/merchant";

export const cleanEmailFromGmail = (
  list: EmailFetchResponseData[],
  merchant: MerchantDocument,
) => {
  const emails = [] as any[];

  for (const email of list) {
    const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
    const body = [];
    for (const part of email.payload.parts) {
      if (part.mimeType === "text/plain") {
        body.push(part.body.data);
      }
    }
    emails.push({
      id: email.id,
      threadId: email.threadId,
      historyId: email.historyId,
      snippet: email.snippet,
      internalDate: email.internalDate, // Miliseconds
      from:
        email.payload.headers.find((header) => header.name === "From")?.value ||
        "",
      subject:
        email.payload.headers.find((header) => header.name === "Subject")
          ?.value || "",
      content: body,
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
