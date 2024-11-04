import {
  extractAddressFromThread,
  extractProductsFromThread,
} from "../../../networking/openAi/extraction";
import {applyDiscount} from "../../../networking/shopify/discounts";
import {
  cancelOrder,
  updateShippingAddress,
} from "../../../networking/shopify/orders";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {LineItem, SuggestedActions} from "../../types/shared";
import {MerchantDocument} from "../../types/merchant";
import {NewShippingAddress} from "../../types/shopify/orders";
import {checkForChangedLineItems} from "./orders";
import {fetchRequestedProducts} from "../shopify/products";

export const performActions = async (
  chat: ChatDocument | EmailDocument,
  type: "email" | "chat",
  suggested: SuggestedActions,
  merchant: MerchantDocument,
) => {
  // if (!merchant.configurations.automate_actions) {
  //   return {performed: false, action: "", error: ""};
  // }
  console.log({performActions: suggested});

  let res = {performed: false, action: "", error: ""};
  switch (suggested) {
    case "apply_discount": {
      res = await applyDiscount(merchant);
      break;
    }
    case "cancel_order": {
      res = await cancelOrder(chat, merchant);
      break;
    }
    case "change_address": {
      res = await changeAddress(chat, merchant);
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

const changeAddress = async (
  chat: ChatDocument | EmailDocument,
  merchant: MerchantDocument,
) => {
  const gpt_response = await extractAddressFromThread(chat);
  console.log(gpt_response);
  if (!gpt_response || gpt_response == "null") {
    return {performed: false, action: "", error: "change_address"};
  }

  try {
    const shipping = (await JSON.parse(gpt_response)) as NewShippingAddress;

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
  console.log(gpt_response);

  if (!gpt_response || gpt_response == "null") {
    return {performed: false, action: "", error: "change_product"};
  }

  try {
    const line_items = (await JSON.parse(gpt_response)) as LineItem[];

    // Check against order line items -> only changed/new LineItem[] | null
    const valid_line_items = checkForChangedLineItems(line_items, chat);
    if (!valid_line_items) {
      return {performed: false, action: "", error: "change_product"};
    }

    console.log({valid_line_items});

    // TODO: Search shopify -> return array {variantId: string, quantity: number}[] | null
    const cleaned_line_items = await fetchRequestedProducts(
      valid_line_items,
      merchant,
    );
    console.log({cleaned_line_items});

    // TODO: Modify order -> {performed: true, action: "", error: ""};

    return {
      performed: false,
      action: JSON.stringify(line_items),
      error: "change_product",
    };
  } catch (error) {
    console.error("CANT PARSE SHIPPING: ", error);
    return {performed: false, action: "", error: "change_product"};
  }
};
