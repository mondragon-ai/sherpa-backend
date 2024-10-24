import {shopifyRequest} from ".";
import {MerchantDocument} from "../../lib/types/merchant";
import {ShopifyPriceRule} from "../../lib/types/shopify/discounts";

type DiscountRequest = {price: number; token: string};
export const createDiscountRule = async (
  discount: DiscountRequest,
  domain: string,
) => {
  const value = isNaN(discount.price)
    ? -5.0
    : String(Math.abs(Number(discount.price.toFixed(1))) * -1);

  const shop = domain.split(".")[0];

  const price_rule = {
    title: "Save Order - Sherpa",
    value_type: "percentage",
    value: value,
    customer_selection: "all",
    target_type: "line_item",
    target_selection: "all",
    allocation_method: "across",
    starts_at: "2018-03-22T00:00:00-00:00",
  };

  const result: {price_rule: ShopifyPriceRule} | null = await shopifyRequest(
    "price_rules.json",
    "POST",
    {
      price_rule: price_rule,
    },
    discount.token,
    shop,
  );

  if (!result) {
    return {
      id: 0,
      title: "",
      value: "",
      value_type: "percentage",
    } as MerchantDocument["configurations"]["price_rules"];
  }

  return {
    id: result.price_rule.id,
    title: price_rule.title,
    value: price_rule.value,
    value_type: "percentage",
  } as MerchantDocument["configurations"]["price_rules"];
};

export const deleteDiscount = async (
  shpat: string,
  domain: string,
  price_rule_id: string,
) => {
  const shop = domain.split(".")[0];
  const result = await shopifyRequest(
    `price_rules/${price_rule_id}.json`,
    "DELETE",
    {},
    shpat,
    shop,
  );

  if (!result) {
    return null;
  }

  return {
    id: 0,
    title: "",
    value: "",
    value_type: "percentage",
  } as MerchantDocument["configurations"]["price_rules"];
};
