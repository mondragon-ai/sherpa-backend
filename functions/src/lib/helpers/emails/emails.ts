import {
  fetchShopifyOrder,
  fetchShopifyOrderByName,
} from "../../../networking/shopify/orders";
import {google} from "googleapis";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {decryptMsg} from "../../../util/encryption";
import {getValidGmailAccessToken} from "./validate";
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
  chat: ChatDocument | EmailDocument,
  suggested_action: SuggestedActions,
  merchant: MerchantDocument,
  actions?: string,
) => {
  const {order} = chat;

  switch (suggested_action) {
    case "apply_discount": {
      if (!actions) return "";
      return buildDiscountEmailPayload(chat, actions);
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

      if (!actions) return "";
      if (order.fulfillment_status !== "hold") {
        return buildAddressChangeCustomerEmailPayload(chat, merchant, actions);
      }
      return buildAddressChangeOrderEmailPayload(chat, actions);
    }
    case "resolve": {
      if (!order) {
        return buildResolveEmailPayload(chat);
      }
      if (chat.classification == ClassificationTypes.OrderStatus) {
        if (
          order.fulfillment_status === "hold" ||
          order.fulfillment_status === "pending"
        ) {
          return buildOrderStatusEmailPayload(chat);
        } else {
          return buildOrderTrackingEmailPayload(chat);
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
      return buildResolveEmailPayload(chat);
    }
  }
};

export const sendEmail = async (
  chat: ChatDocument | EmailDocument,
  suggested_email: string,
  merchant: MerchantDocument,
) => {
  if (!merchant.configurations.automate_emails || !suggested_email) {
    return false;
  }

  // Get email token from merchant
  const mail = merchant.apps.find(
    (a) => a.name == "gmail" || a.name == "outlook",
  );
  if (!mail || !mail.token) return false;

  const token = await getValidGmailAccessToken(merchant);
  if (!token) return false;

  // Fetch Client
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({access_token: token});
  const gmail = google.gmail({version: "v1", auth: oAuth2Client});

  // Encode the message
  if (chat.email) return false;

  const email = [
    `To: ${chat.email}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    "Subject: Follow Up",
    "",
    suggested_email,
  ].join("\n");

  const encodedEmail = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  // Send Email
  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedEmail,
    },
  });

  return response.status < 200 ? true : false;
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

  const last_order = customer.last_order_id;
  if (last_order && !orders) {
    const res = await fetchShopifyOrder(domain, shpat, `${last_order}`);
    if (res) orders = [res];
  }

  const cleaned_customer = cleanCustomerPayload(customer);
  return {customer: cleaned_customer, order: orders};
};
