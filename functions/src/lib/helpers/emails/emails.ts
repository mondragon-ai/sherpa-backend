import {
  fetchShopifyOrder,
  fetchShopifyOrderByName,
} from "../../../networking/shopify/orders";
import {ChatDocument} from "../../types/chats";
import {decryptMsg} from "../../../util/encryption";
import {MerchantDocument} from "../../types/merchant";
import {CleanedCustomerOrder} from "../../types/shopify/orders";
import {buildResolveEmailPayload} from "../../prompts/emails/resolve";
import {cleanCustomerPayload} from "../../payloads/shopify/customers";
import {buildDiscountEmailPayload} from "../../prompts/emails/discount";
import {ClassificationTypes, SuggestedActions} from "../../types/shared";
import {extractOrderNumber} from "../../../networking/openAi/extraction";
import {fetchShopifyCustomer} from "../../../networking/shopify/customers";
import {buildOrderStatusEmailPayload} from "../../prompts/emails/orderStatus";
import {buildChangeProductEmailPayload} from "../../prompts/emails/changeProduct";
import {buildOrderTrackingEmailPayload} from "../../prompts/emails/orderTracking";
import {buildOrderCancelEmailPayload} from "../../prompts/emails/orderCancellation";
import {buildAddressChangeOrderEmailPayload} from "../../prompts/emails/changeAddressOrder";
import {buildCancelSubscriptionEmailPayload} from "../../prompts/emails/cancelSubscription";
import {buildAddressChangeCustomerEmailPayload} from "../../prompts/emails/changeAddressCustomer";
import {buildOrderCancelPendingEmailPayload} from "../../prompts/emails/orderCancellationPending";
import {buildOrderCancelUnavailableEmailPayload} from "../../prompts/emails/orderCancellationUnavailable";

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

export const fetchCustomerDataFromEmail = async (
  merchant: MerchantDocument,
  message: string,
  email: string,
) => {
  const {id: domain, access_token} = merchant;

  const order_number = await extractOrderNumber(message);

  const shpat = await decryptMsg(access_token);
  const customer = await fetchShopifyCustomer(domain, shpat, email);
  if (!customer) return {customer: null, order: null};

  let orders: CleanedCustomerOrder[] | null = null;
  if (order_number) {
    orders = await fetchShopifyOrderByName(domain, shpat, order_number);
  }

  console.log({customer: customer});
  const last_order = customer.last_order_id;
  if (last_order && !orders) {
    const res = await fetchShopifyOrder(domain, shpat, `${last_order}`);
    if (res) orders = [res];
  }
  console.log({orders});

  const cleaned_customer = cleanCustomerPayload(customer);
  return {customer: cleaned_customer, order: orders};
};
