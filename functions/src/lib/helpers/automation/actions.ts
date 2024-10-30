import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {MerchantDocument} from "../../types/merchant";
import {SuggestedActions} from "../../types/shared";

export const performActions = async (
  chat: ChatDocument | EmailDocument,
  type: "email" | "chat",
  suggested: SuggestedActions,
  merchant: MerchantDocument,
) => {
  if (!merchant.configurations.automate_actions) {
    return {performed: false, action: "", error: ""};
  }

  const res = {performed: false, action: "", error: ""};
  switch (suggested) {
    case "apply_discount": {
      console.log(suggested);
      const response = await applyDiscount(chat, type);
      res.performed = response;
      res.error = response ? "" : suggested;
      break;
    }
    case "cancel_order": {
      console.log(suggested);
      const response = await cancelOrder(chat, type);
      res.performed = response;
      res.error = response ? "" : suggested;
      break;
    }
    case "change_address": {
      console.log(suggested);
      const response = await changeAddress(chat, type);
      res.performed = response;
      res.error = response ? "" : suggested;
      break;
    }
    case "resolve": {
      console.log(suggested);
      res.performed = true;
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

  return res;
};

const applyDiscount = async (
  chat: ChatDocument | EmailDocument,
  type: "email" | "chat",
) => {
  return true;
};

const cancelOrder = async (
  chat: ChatDocument | EmailDocument,
  type: "email" | "chat",
) => {
  return true;
};

const changeAddress = async (
  chat: ChatDocument | EmailDocument,
  type: "email" | "chat",
) => {
  return true;
};
