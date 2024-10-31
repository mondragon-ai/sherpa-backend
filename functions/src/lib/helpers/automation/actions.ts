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
  console.log({performActions: suggested});

  const res = {performed: false, action: "", error: ""};
  switch (suggested) {
    case "apply_discount": {
      const response = await applyDiscount(chat, type);
      res.performed = response;
      res.error = response ? "" : suggested;
      break;
    }
    case "cancel_order": {
      const response = await cancelOrder(chat, type);
      res.performed = response;
      res.error = response ? "" : suggested;
      break;
    }
    case "change_address": {
      const response = await changeAddress(chat, type);
      res.performed = response;
      res.error = response ? "" : suggested;
      break;
    }
    case "resolve": {
      res.performed = true;
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
