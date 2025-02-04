import {EmailDocument} from "../types/emails";
import {CleanedEmail} from "../types/gmail/email";
import {uploadToGCP} from "../../database/storage";
import {MerchantDocument} from "../types/merchant";
import {generateRandomID} from "../../util/generators";
import {CleanedCustomerOrder} from "../types/shopify/orders";
import {CleanedCustomerPayload} from "../types/shopify/customers";
import {updateSubcollectionDocument} from "../../database/firestore";
import {CustomerData, OrderData, SuggestedActions} from "../types/shared";
import {getCurrentUnixTimeStampFromTimezone} from "../../util/formatters/time";

export const createEmailPayload = async (
  merchant: MerchantDocument,
  prev_email: EmailDocument,
  customer: CleanedCustomerPayload | null,
  order: CleanedCustomerOrder | null,
  cleaned_email: CleanedEmail,
  message: string,
): Promise<{email: EmailDocument; message: string}> => {
  /* eslint-enable indent */
  const internal_date = Number(cleaned_email.internalDate) / 1000;

  let email = await initializeEmailPyaload(
    merchant,
    customer,
    order,
    cleaned_email,
    message,
  );

  const attachments = await Promise.all(
    (cleaned_email.attachments || []).map(async (a) => {
      const buffer = Buffer.from(a.data, "base64");
      const upload = await uploadToGCP(
        buffer,
        merchant.id,
        prev_email.id,
        a.mime,
      );
      return upload ? upload.file_url : null;
    }),
  );

  const filteredAttachments = attachments.filter((url) => url !== null);

  const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  if (prev_email) {
    const internal_date = Number(cleaned_email.internalDate) / 1000;

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
          time: Math.round(Number(time) - 5),
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
          time: time,
          is_note: false,
          message: message,
          sender: "customer",
          action: null,
          id: cleaned_email.id,
          history_id: cleaned_email.historyId,
          internal_date: String(internal_date),
          from: cleaned_email.from,
          subject: cleaned_email.subject,
          attachments: [],
        },
      ],
      time: time,
      created_at: time,
    };
  }

  const convo = email.conversation.map((a) => {
    if (a.time == internal_date) {
      return {
        ...a,
        attachments: filteredAttachments,
      };
    }
    return a;
  });

  email.conversation = convo;
  return {email, message};
};

export const initializeEmailPyaload = async (
  merchant: MerchantDocument,
  customer: CleanedCustomerPayload | null,
  order: CleanedCustomerOrder | null,
  cleaned_email: CleanedEmail,
  message: string,
): Promise<EmailDocument> => {
  const ID = generateRandomID("chat_");
  const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  const internal_date = Number(cleaned_email.internalDate) / 1000;

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
        time: Math.round(Number(time) - 5),
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
        time: time,
        is_note: false,
        message: message,
        sender: "customer",
        action: null,
        id: cleaned_email.id,
        history_id: cleaned_email.historyId,
        internal_date: String(internal_date),
        from: cleaned_email.from,
        subject: cleaned_email.subject,
        attachments: [],
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

  const attachments = await Promise.all(
    (cleaned.attachments || []).map(async (a) => {
      const buffer = Buffer.from(a.data, "base64");
      const upload = await uploadToGCP(
        buffer,
        merchant.id,
        prev_email.id,
        a.mime,
      );
      return upload ? upload.file_url : null;
    }),
  );

  const filteredAttachments = attachments.filter((url) => url !== null);

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
        attachments: filteredAttachments.length ? filteredAttachments : [],
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
