import {
  addVariantToOrder,
  cancelOrder,
  startOrderEdit,
  updateShippingAddress,
} from "../../../networking/shopify/orders";
import {
  extractAddressFromThread,
  extractProductsFromThread,
} from "../../../networking/openAi/extraction";
import {
  cancelRechargeSubscription,
  getRechargeSubscription,
} from "../../../networking/recharge/subscriptions";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {checkForChangedLineItems} from "./orders";
import {MerchantDocument} from "../../types/merchant";
import {fetchRequestedProducts} from "../shopify/products";
import {LineItem, OrderData, SuggestedActions} from "../../types/shared";
import {NewShippingAddress} from "../../types/shopify/orders";
import {cleanGPTResponse} from "../../../util/formatters/text";
import {RechargeCustomers} from "../../types/recharge/customers";
import {applyDiscount} from "../../../networking/shopify/discounts";
import {findRechargeCustomer} from "../../../networking/recharge/customers";

export const performActions = async (
  chat: ChatDocument | EmailDocument,
  type: "email" | "chat",
  suggested: SuggestedActions,
  merchant: MerchantDocument,
) => {
  if (!merchant.configurations.automate_actions) {
    return {performed: false, action: "", error: ""};
  }

  let res = {performed: false, action: "", error: ""};
  switch (suggested) {
    case "apply_discount": {
      res = await applyDiscount(merchant);
      break;
    }
    case "cancel_order": {
      if (!chat || !chat.order) return res;
      const status =
        chat.order.fulfillment_status.toLocaleUpperCase() as OrderData["fulfillment_status"];
      if (
        status == "partially_fulfilled" ||
        status == "hold" ||
        status == "unfulfilled" ||
        status == "scheduled" ||
        status == "on_hold"
      ) {
        res = await cancelOrder(chat, merchant);
      }
      break;
    }
    case "change_address": {
      if (!chat || !chat.order) return res;
      const status =
        chat.order.fulfillment_status.toLocaleUpperCase() as OrderData["fulfillment_status"];
      if (
        status == "partially_fulfilled" ||
        status == "hold" ||
        status == "unfulfilled" ||
        status == "scheduled" ||
        status == "on_hold"
      ) {
        res = await changeAddress(chat, merchant);
      }
      break;
    }
    case "resolve": {
      res.performed = true;
      break;
    }
    case "change_product": {
      res = await changeProduct(chat, merchant);
      break;
    }
    case "cancel_subscription": {
      res = await handleSubscription(merchant, chat);
      break;
    }
    case "exchange": {
      res = await changeProduct(chat, merchant);
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

const changeAddress = async (
  chat: ChatDocument | EmailDocument,
  merchant: MerchantDocument,
) => {
  const gpt_response = await extractAddressFromThread(chat);
  // console.log(gpt_response);
  if (!gpt_response || gpt_response == "null") {
    return {performed: false, action: "", error: "change_address"};
  }

  try {
    const shipping = (await JSON.parse(
      cleanGPTResponse(gpt_response),
    )) as NewShippingAddress;

    return updateShippingAddress(chat, merchant, shipping);
  } catch (error) {
    console.error("CANT PARSE SHIPPING: ", error);
    return {performed: false, action: "", error: "change_address"};
  }
};

const changeProduct = async (
  chat: ChatDocument | EmailDocument,
  merchant: MerchantDocument,
) => {
  const gpt_response = await extractProductsFromThread(chat);

  if (!gpt_response || gpt_response == "null") {
    return {performed: false, action: "", error: "change_product"};
  }

  try {
    const line_items = (await JSON.parse(
      cleanGPTResponse(gpt_response),
    )) as LineItem[];

    // Check against order line items -> only changed/new LineItem[] | null
    const valid_line_items = checkForChangedLineItems(line_items, chat);
    if (!valid_line_items) {
      console.error("Cant Check for changed line Items");
      return {performed: false, action: "", error: "change_product"};
    }

    // Remove line item
    const order_edit = await startOrderEdit(chat, merchant);
    if (!order_edit?.id) {
      console.error("Cant Start Order Edit");
      return {performed: false, action: "", error: "change_product"};
    }

    // Search shopify -> return array {variantId: string, quantity: number}[] | null
    const variants = await fetchRequestedProducts(
      valid_line_items,
      merchant,
      order_edit,
    );
    if (!variants || !variants.length) {
      console.error("Cant Fetch Requested Products from shopify");
      return {performed: false, action: "", error: "change_product"};
    }

    // Add Vairant to Order
    for (const v of variants) {
      const added = await addVariantToOrder(merchant, order_edit, v.variant_id);
      if (!added) {
        console.error("Cant Add Requested Variants to order");
        return {performed: false, action: "", error: "change_product"};
      }
    }

    return {
      performed: true,
      action: "",
      error: "",
    };
  } catch (error) {
    console.error("CANT PARSE EXTRACED PRODUCTS: ", {error, gpt_response});
    return {performed: false, action: "", error: "change_product"};
  }
};

const handleSubscription = async (
  merchant: MerchantDocument,
  chat: ChatDocument | EmailDocument,
) => {
  const customer = await findRechargeCustomer(merchant, chat);
  if (!customer) {
    console.error("Finding Recharge Customer");
    return {performed: false, action: "", error: "cancel_subscription"};
  }

  const recharge_customer = customer as RechargeCustomers;
  if (
    !recharge_customer.customers ||
    !recharge_customer?.customers[0] ||
    !recharge_customer?.customers[0]?.id
  ) {
    console.error("Finding Recharge Customer ID");
    return {performed: false, action: "", error: "cancel_subscription"};
  }

  const recharge_id = recharge_customer?.customers[0].id;
  const sub = await getRechargeSubscription(merchant, recharge_id);
  if (!sub) {
    console.error("Finding Recharge Subscription ID");
    return {performed: false, action: "", error: "cancel_subscription"};
  }

  // TODO: Add gpt to determine is if its a freeze vs cancel
  // await freezeRechargeSubscription(merchant, sub.sub_id, sub.date);
  const action = await cancelRechargeSubscription(merchant, sub.sub_id);

  return {
    performed: action,
    action: "",
    error: action ? "" : "cancel_subscription",
  };
};
