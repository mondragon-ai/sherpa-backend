import {
  fetchRootDocument,
  updateRootDocument,
} from "../../../database/firestore";
import {createResponse} from "../../../util/errors";
import {MerchantDocument} from "../../../lib/types/merchant";
import {getCurrentUnixTimeStampFromTimezone} from "../../../util/formatters/time";
import {
  createDiscountRule,
  deleteDiscount,
} from "../../../networking/shopify/discounts";

type DiscountRequest = {price: number; token: string};

export const createDiscount = async (
  domain: string,
  discount: DiscountRequest,
) => {
  if (!domain || !discount) return createResponse(400, "Missing Domain", null);

  const payload = await createDiscountRule(discount, domain);
  if (!payload.id) return createResponse(400, "Couldn't Create", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "No merchant found", null);

  merchant.configurations.price_rules = payload;
  merchant.updated_at = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  await updateRootDocument("shopify_merchant", domain, merchant);

  return {
    status: 200,
    message: "Created Discount",
    data: {discount: null},
  };
};

export const deleteDiscountRule = async (
  domain: string,
  token: string,
  id: string,
) => {
  if (!domain) return createResponse(400, "Missing params", null);

  const is_deleted = await deleteDiscount(token, domain, id);
  if (!is_deleted) return createResponse(400, "Couldn't Delete", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "No merchant found", null);

  merchant.configurations.price_rules = is_deleted;
  merchant.updated_at = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  await updateRootDocument("shopify_merchant", domain, merchant);

  return createResponse(200, "Updated Bot's Configurations", null);
};
