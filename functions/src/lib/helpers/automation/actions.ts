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
      console.log(suggested);
      performed = await applyDiscount(chat, type);
      break;
    }
    case "cancel_order": {
      console.log(suggested);
      performed = await cancelOrder(chat, type);
      break;
    }
    case "change_address": {
      console.log(suggested);
      performed = await changeAddress(chat, type);
      break;
    }
    case "resolve": {
      console.log(suggested);
      performed = true;
      break;
    }
    case "cancel_subscription": {
      console.log(suggested);
      break;
    }
    case "change_product": {
      console.log(suggested);
      break;
    }
    case "exchange": {
      console.log(suggested);
      break;
    }
    case "unknown": {
      console.log(suggested);
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
