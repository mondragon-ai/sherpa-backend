import {ChatDocument} from "../../types/chats";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes, SuggestedActions} from "../../types/shared";

export const generateSuggestedEmail = (
  chat: ChatDocument,
  suggested_action: SuggestedActions,
) => {
  const {order} = chat;

  switch (suggested_action) {
    case "apply_discount": {
      if (!order) {
        return "";
      }

      if (order.fulfillment_status !== "hold") {
        return "";
      }
      return "";
    }
    case "cancel_order": {
      if (!order) {
        return "";
      }
      if (order.fulfillment_status === "hold") {
        return "";
      } else if (order.fulfillment_status === "pending") {
        return "";
      } else {
        return "";
      }
    }
    case "change_address": {
      return "";
    }
    case "resolve": {
      if (!order) {
        return "";
      }
      if (chat.classification == ClassificationTypes.OrderStatus) {
        if (
          order.fulfillment_status === "hold" ||
          order.fulfillment_status === "pending"
        ) {
          return "";
        } else {
          return "";
        }
      }
      return "";
    }
    case "cancel_subscription": {
      return "";
    }
    case "change_product": {
      return "";
    }
    case "exchange": {
      return "";
    }
    case "unknown": {
      return "";
    }
    default: {
      return "";
    }
  }
};

export const sendEmail = async (
  chat: ChatDocument,
  type: "email" | "chat",
  suggested_email: string,
  merchant: MerchantDocument,
) => {
  if (!merchant.configurations.automate_emails) return false;
  return true;
};
