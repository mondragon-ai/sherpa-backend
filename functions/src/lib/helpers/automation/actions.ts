import {
  extractAddressFromThread,
  extractProductsFromThread,
} from "../../../networking/openAi/extraction";
import {applyDiscount} from "../../../networking/shopify/discounts";
import {
  addVariantToOrder,
  cancelOrder,
  startOrderEdit,
  updateShippingAddress,
} from "../../../networking/shopify/orders";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {LineItem, SuggestedActions} from "../../types/shared";
import {MerchantDocument} from "../../types/merchant";
import {NewShippingAddress} from "../../types/shopify/orders";
import {checkForChangedLineItems} from "./orders";
import {fetchRequestedProducts} from "../shopify/products";
import {cleanGPTResponse} from "../../../util/formatters/text";

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
