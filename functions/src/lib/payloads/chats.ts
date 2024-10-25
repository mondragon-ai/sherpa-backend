import {capitalizeWords} from "../../util/formatters/text";
import {getCurrentUnixTimeStampFromTimezone} from "../../util/formatters/time";
import {generateRandomID} from "../../util/generators";
import {ChatDocument, ChatStartRequest} from "../types/chats";
import {MerchantDocument} from "../types/merchant";
import {CustomerData, OrderData} from "../types/shared";
import {CleanedCustomerPayload} from "../types/shopify/customers";
import {CleanedCustomerOrder} from "../types/shopify/orders";

export const createChatPayload = (
  merchant: MerchantDocument,
  prev_chat: ChatDocument,
  customer: CleanedCustomerPayload | null,
  order: CleanedCustomerOrder | null,
  request: ChatStartRequest,
): {chat: ChatDocument; message: string} => {
  let chat = initializeChatPyaload(merchant, customer, order, request);
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
      ],
      created_at: prev_chat.created_at,
    };
  }

  const first_name = customer
    ? capitalizeWords(customer.first_name.toLocaleLowerCase().trim())
    : "";

  const issue =
    request.issue == "general" ? `${request.issue} store` : request.issue;

  const message = `Hello ${first_name}, welcome to our store's customer support! How can I assist you with your ${issue} question today?`;

  return {chat, message};
};

export const initializeChatPyaload = (
  merchant: MerchantDocument,
  customer: CleanedCustomerPayload | null,
  order: CleanedCustomerOrder | null,
  payload: ChatStartRequest,
): ChatDocument => {
  const ID = generateRandomID("chat_");
  const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  return {
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
    issue: payload.issue,
    suggested_action_done: false,
    summary: "",
    error_info: "",
    timezone: merchant.timezone,
    domain: merchant.id,
    id: payload.email || ID,
    conversation: [
      {
        time: time,
        is_note: false,
        message: "",
        sender: "agent",
        action: "opened",
      },
    ],
    time: time,
    status: "open",
    suggested_action: null,
    customer: customer as CustomerData | null,
    email: payload.email,
    updated_at: time,
    created_at: time,
    order: order as OrderData | null,
  };
};
