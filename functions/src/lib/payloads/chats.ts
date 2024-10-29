import {MerchantDocument} from "../types/merchant";
import {generateRandomID} from "../../util/generators";
import {
  AlgoliaSearchType,
  CustomerData,
  OrderData,
  SuggestedActions,
} from "../types/shared";
import {capitalizeWords} from "../../util/formatters/text";
import {CleanedCustomerOrder} from "../types/shopify/orders";
import {ChatDocument, ChatStartRequest} from "../types/chats";
import {CleanedCustomerPayload} from "../types/shopify/customers";
import {getCurrentUnixTimeStampFromTimezone} from "../../util/formatters/time";
import {EmailDocument} from "../types/emails";

export const createChatPayload = (
  merchant: MerchantDocument,
  prev_chat: ChatDocument,
  customer: CleanedCustomerPayload | null,
  order: CleanedCustomerOrder | null,
  request: ChatStartRequest,
): {chat: ChatDocument; message: string} => {
  /* eslint-disable indent */
  const first_name = customer
    ? ` ${capitalizeWords(
        customer.first_name.toLocaleLowerCase().trim(),
      ).trim()}`
    : "";
  const issue =
    request.issue == "general" ? `${request.issue} store` : request.issue;
  const message = `Hello${first_name}, welcome to our store's customer support! How can I assist you with your ${issue} question today?`;
  /* eslint-enable indent */
  let chat = initializeChatPyaload(merchant, customer, order, request, message);
  const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  if (prev_chat) {
    chat = {
      ...chat,
      conversation: [
        ...prev_chat.conversation,
        {
          time: time,
          is_note: false,
          message: "",
          sender: "agent",
          action: "opened",
        },
        {
          time: time,
          is_note: false,
          message: message,
          sender: "agent",
          action: null,
        },
      ],
      created_at: prev_chat.created_at,
    };
  }

  return {chat, message};
};

export const initializeChatPyaload = (
  merchant: MerchantDocument,
  customer: CleanedCustomerPayload | null,
  order: CleanedCustomerOrder | null,
  payload: ChatStartRequest,
  message: string,
): ChatDocument => {
  const ID = generateRandomID("chat_");
  const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);

  return {
    edited: false,
    suggested_email: "",
    specific_issue: payload.specific_issue,
    email_sent: false,
    manual: false,
    manually_triggerd: false,
    initial_message: "",
    convo_trained: false,
    action_trained: false,
    rating: null,
    classification: null,
    issue: payload.issue,
    suggested_action_done: false,
    summary: "",
    error_info: "",
    timezone: merchant.timezone,
    domain: merchant.id,
    id: payload.email || ID,
    sentiment: null,
    conversation: [
      {
        time: time,
        is_note: false,
        message: "",
        sender: "agent",
        action: "opened",
      },
      {
        time: time,
        is_note: false,
        message: message,
        sender: "agent",
        action: null,
      },
    ],
    time: time,
    status: "open",
    suggested_action: null,
    customer: customer as CustomerData | null,
    order: order as OrderData | null,
    email: payload.email,
    updated_at: time,
    created_at: time,
  };
};

export const respondToChatPayload = (
  chat: ChatDocument,
  timzone: string,
  repsonse: string,
  message: string,
  classification: string,
) => {
  const time = getCurrentUnixTimeStampFromTimezone(timzone);
  return {
    ...chat,
    conversation: [
      ...(chat.conversation || []),
      {
        time: time - Math.round(60 * 1.5),
        is_note: false,
        message: message,
        sender: "customer",
        action: null,
      },
      {
        time: time,
        is_note: false,
        message: repsonse,
        sender: "agent",
        action: null,
      },
    ],
    classification: classification,
    updated_at: time,
  } as ChatDocument;
};

type AutomaticAction = {
  email: boolean;
  action: boolean;
  suggested_email: string;
  error: string;
};

export const buildResolvedChatPayload = (
  chat: ChatDocument | EmailDocument,
  merchant: MerchantDocument,
  suggested: SuggestedActions,
  actions: AutomaticAction,
  type: "email" | "chat",
  summary = "",
) => {
  const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);

  /* eslint-disable indent */
  const conversation =
    type == "chat"
      ? {
          time: time,
          is_note: false,
          message: "",
          sender: "agent",
          action: "closed",
        }
      : {
          time: time,
          is_note: false,
          message: "",
          sender: "agent",
          action: "closed",
          id: "",
          history_id: "",
          internal_date: "",
          from: "",
          subject: "",
          attachments: [],
        };

  return {
    ...chat,
    suggested_email: actions.suggested_email,
    email_sent: actions.email,
    suggested_action_done: actions.action,
    summary: summary,
    error_info: actions.error || "",
    status:
      suggested == "resolve"
        ? "resolved"
        : actions.action
        ? "resolved"
        : "action_required",
    suggested_action: suggested,
    updated_at: time,
    conversation: [...(chat.conversation || []), conversation],
  } as ChatDocument;
  /* eslint-enable indent */
};

export const algoliaChatCreatePayload = (
  chat: ChatDocument | EmailDocument,
) => {
  const {customer, id, email, issue, status, suggested_action, classification} =
    chat;
  return {
    id: id,
    first_name: customer ? customer.first_name : "",
    lasst_name: customer ? customer.last_name : "",
    email: email || "",
    issue: issue || "",
    status: status || "",
    suggested_action: suggested_action || "",
    classification: classification || "",
  } as AlgoliaSearchType;
};

export const updateExistingChatConversation = async (
  prev_chat: ChatDocument,
  message: string,
  merchant: MerchantDocument,
) => {
  const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  const payload = {
    ...prev_chat,
    status: "open",
    classification: null,
    suggested_action: null,
    summary: "",
    error_info: "",
    conversation: [
      ...prev_chat.conversation,
      {
        time: time,
        is_note: false,
        message: message,
        sender: "customer",
        action: null,
      },
    ],
    created_at: prev_chat.created_at,
  };
  return payload;
};
