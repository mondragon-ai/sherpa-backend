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
import {buildNoOrderPayload} from "../../prompts/emails/noOrder";
import {buildNoSubscriptionFoundPayload} from "../../prompts/emails/subscriptionNotFound";

export const generateSuggestedEmail = (
  chat: ChatDocument | EmailDocument,
  suggested_action: SuggestedActions,
  merchant: MerchantDocument,
  actions?: string,
  error?: string,
) => {
  const {order} = chat;

  if (!order) {
    return buildNoOrderPayload(chat);
  }

  switch (suggested_action) {
    case "apply_discount": {
      if (!actions) return "";
      return buildDiscountEmailPayload(chat, actions);
    }
    case "cancel_order": {
      const status = order.fulfillment_status.toLocaleUpperCase();
      if (
        status === "hold" ||
        status === "unfulfilled" ||
        status === "on_hold" ||
        status === "open" ||
        status === "scheduled"
      ) {
        return buildOrderCancelEmailPayload(chat);
      } else if (status === "in_progress" || status === "pending") {
        return buildOrderCancelPendingEmailPayload(chat, merchant);
      } else {
        return buildOrderCancelUnavailableEmailPayload(chat, merchant);
      }
    }
    case "change_address": {
      const status = order.fulfillment_status.toLocaleUpperCase();
      if (!actions) return "";
      // TODO: Create address not found order email template
      if (
        status === "hold" ||
        status === "pending" ||
        status === "unfulfilled" ||
        status === "on_hold" ||
        status === "open" ||
        status === "in_progress" ||
        status === "scheduled"
      ) {
        return buildAddressChangeCustomerEmailPayload(chat, actions);
      }
      return buildAddressChangeOrderEmailPayload(chat, actions);
    }
    case "resolve": {
      const status = order.fulfillment_status.toLocaleUpperCase();
      if (chat.classification == ClassificationTypes.OrderStatus) {
        if (
          status === "hold" ||
          status === "pending" ||
          status === "unfulfilled" ||
          status === "on_hold" ||
          status === "open" ||
          status === "in_progress" ||
          status === "scheduled"
        ) {
          return buildOrderStatusEmailPayload(chat);
        } else {
          return buildOrderTrackingEmailPayload(chat);
        }
        // TODO: Create in_progress order email template (3rd party fulfillment)
      }
      return buildResolveEmailPayload(chat);
    }
    case "cancel_subscription": {
      if (error) {
        return buildNoSubscriptionFoundPayload(chat);
      }
      if (actions == "freeze") return ""; // TODO: create freeze email template
      return buildCancelSubscriptionEmailPayload(chat);
    }
    case "change_product": {
      // TODO: create Cant Switch (out of stock)
      return buildChangeProductEmailPayload(chat);
    }
    case "exchange": {
      // TODO: create Cant Switch (out of stock)
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
  console.log({order_number});

  const shpat = await decryptMsg(access_token);
  const customer = await fetchShopifyCustomer(domain, shpat, email);
  if (!customer) return {customer: null, order: null};

  let orders: CleanedCustomerOrder[] | null = null;
  if (order_number) {
    orders = await fetchShopifyOrderByName(domain, shpat, order_number);
  }

  const last_order = customer.last_order_id;
  if (last_order && (!orders || !orders.length)) {
    const res = await fetchShopifyOrder(domain, shpat, `${last_order}`);
    if (res) orders = [res];
  }

  const cleaned_customer = cleanCustomerPayload(customer);
  return {customer: cleaned_customer, order: orders};
};
