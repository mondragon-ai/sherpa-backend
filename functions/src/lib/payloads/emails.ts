import {MerchantDocument} from "../types/merchant";
import {generateRandomID} from "../../util/generators";
import {CleanedCustomerOrder} from "../types/shopify/orders";
import {EmailDocument} from "../types/emails";
import {CleanedCustomerPayload} from "../types/shopify/customers";
import {CustomerData, OrderData, SuggestedActions} from "../types/shared";
import {getCurrentUnixTimeStampFromTimezone} from "../../util/formatters/time";
import {CleanedEmail} from "../types/gmail/email";
import {updateSubcollectionDocument} from "../../database/firestore";
import {uploadToGCP} from "../../database/storage";

export const createEmailPayload = (
  merchant: MerchantDocument,
  prev_email: EmailDocument,
  customer: CleanedCustomerPayload | null,
  order: CleanedCustomerOrder | null,
  cleaned_email: CleanedEmail,
  message: string,
): {email: EmailDocument; message: string} => {
  /* eslint-enable indent */
  let email = initializeEmailPyaload(
    merchant,
    customer,
    order,
    cleaned_email,
    message,
  );

  const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  if (prev_email) {
    const internal_date = Number(cleaned_email.internalDate) / 1000;

    const attachments: string[] = [];

    if (cleaned_email.attachments) {
      cleaned_email.attachments.forEach(async (a) => {
        console.log({a});
        const buffer = Buffer.from(a.data, "base64");
        console.log({buffer});

        const upload = await uploadToGCP(
          buffer,
          merchant.id,
          prev_email.id,
          a.mime,
        );
        if (upload) {
          attachments.push(upload.file_url);
        }
      });
    }

    email = {
      ...prev_email,
      status: "open",
      customer: customer as CustomerData | null,
      order: (order as OrderData | null) || null,
      classification: null,
      suggested_action: null,
      summary: "",
      error_info: "",
      conversation: [
        ...prev_email.conversation,
        {
          time: time,
          is_note: false,
          message: "",
          sender: "agent",
          action: "opened",
          id: "",
          history_id: "",
          internal_date: "",
          from: "",
          subject: "",
          attachments: [],
        },
        {
          time: internal_date,
          is_note: false,
          message: message,
          sender: "customer",
          action: null,
          id: cleaned_email.id,
          history_id: cleaned_email.historyId,
          internal_date: String(internal_date),
          from: cleaned_email.from,
          subject: cleaned_email.subject,
          attachments: attachments.length ? attachments : [],
        },
      ],
      time: internal_date,
      created_at: internal_date,
    };
  }

  return {email, message};
};

export const initializeEmailPyaload = (
  merchant: MerchantDocument,
  customer: CleanedCustomerPayload | null,
  order: CleanedCustomerOrder | null,
  cleaned_email: CleanedEmail,
  message: string,
): EmailDocument => {
  const ID = generateRandomID("chat_");
  const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  const internal_date = Number(cleaned_email.internalDate) / 1000;

  const attachments: string[] = [];

  if (cleaned_email.attachments) {
    cleaned_email.attachments.forEach(async (a) => {
      const buffer = Buffer.from(a.data, "base64");
      const upload = await uploadToGCP(
        buffer,
        merchant.id,
        cleaned_email.from || ID,
        a.mime,
      );
      if (upload) {
        attachments.push(upload.file_url);
      }
    });
  }

  return {
    sentiment: null,
    email: cleaned_email.from,
    customer: customer as CustomerData | null,
    order: order as OrderData | null,
    source: "gmail",
    rating: null,
    classification: null,
    status: "open",
    suggested_action: null,
    edited: false,
    suggested_email: "",
    specific_issue: "",
    email_sent: false,
    manual: false,
    manually_triggerd: false,
    initial_message: "",
    convo_trained: false,
    action_trained: false,
    issue: null,
    suggested_action_done: false,
    summary: "",
    error_info: "",
    timezone: merchant.timezone,
    domain: merchant.id,
    id: cleaned_email.from || ID,
    conversation: [
      {
        time: time,
        is_note: false,
        message: "",
        sender: "agent",
        action: "opened",
        id: "",
        history_id: "",
        internal_date: "",
        from: "",
        subject: "",
        attachments: [],
      },
      {
        time: internal_date,
        is_note: false,
        message: message,
        sender: "customer",
        action: null,
        id: cleaned_email.id,
        history_id: cleaned_email.historyId,
        internal_date: String(internal_date),
        from: cleaned_email.from,
        subject: cleaned_email.subject,
        attachments: attachments.length ? attachments : [],
      },
    ],
    time: time,
    updated_at: time,
    created_at: time,
    history_id: "",
  };
};

export const buildResolvedChatPayload = (
  chat: EmailDocument,
  merchant: MerchantDocument,
  suggested: SuggestedActions,
  actions: {
    email: boolean;
    action: boolean;
    suggested_email: string;
  },
  summary = "",
  error = "",
) => {
  const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);

  /* eslint-disable indent */
  return {
    ...chat,
    suggested_email: actions.suggested_email,
    email_sent: actions.email,
    suggested_action_done: actions.action,
    summary: summary,
    error_info: error,
    status:
      suggested == "resolve"
        ? "resolved"
        : actions.action
        ? "resolved"
        : "action_required",
    suggested_action: suggested,
    updated_at: time,
    conversation: [
      ...(chat.conversation || []),
      {
        time: time,
        is_note: false,
        message: "",
        sender: "agent",
        action: "closed",
      },
    ],
  } as EmailDocument;
  /* eslint-enable indent */
};

export const updateExistingEmailConversation = async (
  prev_email: EmailDocument,
  message: string,
  cleaned: CleanedEmail,
  merchant: MerchantDocument,
) => {
  const internal_date = Number(cleaned.internalDate) / 1000;
  const payload = {
    ...prev_email,
    status: "open",
    classification: null,
    suggested_action: null,
    summary: "",
    error_info: "",
    conversation: [
      ...prev_email.conversation,
      {
        time: internal_date,
        is_note: false,
        message: message,
        sender: "customer",
        action: null,
        id: cleaned.id,
        history_id: cleaned.historyId,
        internal_date: String(internal_date),
        from: cleaned.from,
        subject: cleaned.subject,
        attachments: cleaned.attachments || [],
      },
    ],
    created_at: prev_email.created_at,
  };

  await updateSubcollectionDocument(
    "shopify_merchant",
    merchant.id,
    "emails",
    payload.id,
    payload,
  );
};
