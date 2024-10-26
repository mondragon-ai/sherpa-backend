import {buildDiscountEmailPayload} from "../../prompts/emails/discount";
import {buildOrderCancelEmailPayload} from "../../prompts/emails/orderCancellation";
import {buildAddressChangeCustomerEmailPayload} from "../../prompts/emails/changeAddressCustomer";
import {buildOrderCancelPendingEmailPayload} from "../../prompts/emails/orderCancellationPending";
import {buildOrderCancelUnavailableEmailPayload} from "../../prompts/emails/orderCancellationUnavailable";
import {ChatDocument} from "../../types/chats";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes, SuggestedActions} from "../../types/shared";
import {buildAddressChangeOrderEmailPayload} from "../../prompts/emails/changeAddressOrder";
import {buildChangeProductEmailPayload} from "../../prompts/emails/changeProduct";
import {buildCancelSubscriptionEmailPayload} from "../../prompts/emails/cancelSubscription";
import {buildOrderStatusEmailPayload} from "../../prompts/emails/orderStatus";
import {buildResolveEmailPayload} from "../../prompts/emails/resolve";
import {buildOrderTrackingEmailPayload} from "../../prompts/emails/orderTracking";

export const generateSuggestedEmail = (
  chat: ChatDocument,
  suggested_action: SuggestedActions,
  merchant: MerchantDocument,
) => {
  const {order} = chat;

  switch (suggested_action) {
    case "apply_discount": {
      return buildDiscountEmailPayload(chat, "");
    }
    case "cancel_order": {
      if (!order) {
        return "";
      }
      if (order.fulfillment_status === "hold") {
        return buildOrderCancelEmailPayload(chat);
      } else if (order.fulfillment_status === "pending") {
        return buildOrderCancelPendingEmailPayload(chat, merchant);
      } else {
        return buildOrderCancelUnavailableEmailPayload(chat, merchant);
      }
    }
    case "change_address": {
      if (!order) {
        return "";
      }

      if (order.fulfillment_status !== "hold") {
        return buildAddressChangeCustomerEmailPayload(chat, merchant, "");
      }
      return buildAddressChangeOrderEmailPayload(chat, merchant, "");
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
          return buildOrderStatusEmailPayload(chat);
        } else {
          return buildOrderTrackingEmailPayload(chat, "");
        }
      }
      return buildResolveEmailPayload(chat);
    }
    case "cancel_subscription": {
      return buildCancelSubscriptionEmailPayload(chat);
    }
    case "change_product": {
      return buildChangeProductEmailPayload(chat);
    }
    case "exchange": {
      return buildChangeProductEmailPayload(chat);
    }
    case "unknown": {
      return "";
    }
    default: {
      return buildOrderTrackingEmailPayload(chat, "");
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

  // TODO: Get gmail client

  // TODO: Encode the message

  // TODO: Send Email

  return true;
};
