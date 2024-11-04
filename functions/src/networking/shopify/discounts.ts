import {shopifyGraphQlRequest} from ".";
import {MerchantDocument} from "../../lib/types/merchant";
import {
  DiscountCodeCreateResponse,
  DiscountRedeemCodeBulkAddResponse,
} from "../../lib/types/shopify/discounts";
import {decryptMsg} from "../../util/encryption";

type DiscountRequest = {price: number; token: string};
export const createDiscountRule = async (
  discount: DiscountRequest,
  domain: string,
) => {
  const value = isNaN(discount.price)
    ? 0.05
    : Math.abs(Number(discount.price) / 100);

  const shop = domain.split(".")[0];

  const payload = {
    query:
      "mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) { discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) { codeDiscountNode { id codeDiscount { ... on DiscountCodeBasic { title codes(first: 10) { nodes { id code } } startsAt endsAt } } } userErrors { field code message } } }",
    variables: {
      basicCodeDiscount: {
        title: "20% off all items during the summer of 2022",
        code: "subs",
        startsAt: "2022-06-21T00:00:00Z",
        endsAt: "2025-09-21T00:00:00Z",
        customerSelection: {
          all: true,
        },
        customerGets: {
          appliesOnOneTimePurchase: true,
          items: {
            all: true,
          },
          value: {
            percentage: value,
          },
        },
        appliesOncePerCustomer: true,
        usageLimit: 1,
      },
    },
  };
  const {data} = await shopifyGraphQlRequest(shop, discount.token, payload);
  const result = data as DiscountCodeCreateResponse["data"];

  if (!result.discountCodeBasicCreate) {
    return {
      id: "",
      title: "",
      value: "",
      value_type: "percentage",
    } as MerchantDocument["configurations"]["price_rules"];
  }

  return {
    id: result.discountCodeBasicCreate.codeDiscountNode.id,
    title: "Sherpa - Save Order",
    value: String(value),
    value_type: "percentage",
  } as MerchantDocument["configurations"]["price_rules"];
};

export const deleteDiscount = async (
  shpat: string,
  domain: string,
  price_rule_id: string,
) => {
  const shop = domain.split(".")[0];
  const query = `
    mutation discountCodeDelete($id: ID!) {
        discountCodeDelete(id: $id) {
            deletedCodeDiscountId
            userErrors {
                field
                code
                message
            }
        }
    }
  `;

  const variables = {
    id: price_rule_id,
  };
  const {data} = await shopifyGraphQlRequest(shop, shpat, {query, variables});

  if (!data) {
    return null;
  }

  return {
    id: "",
    title: "",
    value: "",
    value_type: "percentage",
  } as MerchantDocument["configurations"]["price_rules"];
};

export const applyDiscount = async (merchant: MerchantDocument) => {
  const discount_id = merchant.configurations.price_rules?.id
    ? merchant.configurations.price_rules.id
    : "";

  const coupon = Array.from(Array(10), () => Math.random().toString(36)[2])
    .join("")
    .toUpperCase();

  const query = `
    mutation discountRedeemCodeBulkAdd($discountId: ID!, $codes: [DiscountRedeemCodeInput!]!) {
      discountRedeemCodeBulkAdd(discountId: $discountId, codes: $codes) {
        bulkCreation {
          id
        }
        userErrors {
          code
          field
          message
        }
      }
    }`;

  const variables = {
    discountId: discount_id,
    codes: [{code: coupon}],
  };

  if (!discount_id) {
    return {performed: false, action: "", error: "apply_discount"};
  }

  const shop = merchant.id.split(".")[0];
  const shpat = await decryptMsg(merchant.access_token);
  const response = await shopifyGraphQlRequest(shop, shpat, {query, variables});
  const data = response.data as DiscountRedeemCodeBulkAddResponse;

  if (!data.discountRedeemCodeBulkAdd.bulkCreation) {
    return {performed: false, action: "", error: "apply_discount"};
  }

  return {performed: true, action: coupon, error: ""};
};
