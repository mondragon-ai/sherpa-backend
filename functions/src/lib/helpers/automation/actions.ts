import {ChatDocument} from "../../types/chats";
import {MerchantDocument} from "../../types/merchant";
import {SuggestedActions} from "../../types/shared";

export const performActions = async (
  chat: ChatDocument,
  type: "email" | "chat",
  suggested: SuggestedActions,
  merchant: MerchantDocument,
) => {
  if (!merchant.configurations.automate_actions) return false;

  let performed = false;
  switch (suggested) {
    case "apply_discount": {
      performed = await applyDiscount(chat, type);
      break;
    }
    case "cancel_order": {
      performed = await cancelOrder(chat, type);
      break;
    }
    case "change_address": {
      performed = await changeAddress(chat, type);
      break;
    }
    case "resolve": {
      break;
    }
    case "cancel_subscription": {
      break;
    }
    case "change_product": {
      break;
    }
    case "exchange": {
      break;
    }
    case "unknown": {
      break;
    }
    default: {
      break;
    }
  }

  return performed;
};

const applyDiscount = async (chat: ChatDocument, type: "email" | "chat") => {
  return true;
};

const cancelOrder = async (chat: ChatDocument, type: "email" | "chat") => {
  return true;
};

const changeAddress = async (chat: ChatDocument, type: "email" | "chat") => {
  return true;
};
