import {fetchRootDocument} from "../../../database/firestore";
import {MerchantDocument} from "../../../lib/types/merchant";
import {fetchShopifyCustomer} from "../../../networking/shopify/customers";
import {decryptMsg} from "../../../util/encryption";
import {createResponse} from "../../../util/errors";

export const searchCustomer = async (domain: string, email: string) => {
  if (!domain || !email) return createResponse(400, "Missing params", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "No merchant found", null);

  const shpat = await decryptMsg(merchant.access_token);
  const customer = await fetchShopifyCustomer(domain, shpat, email);
  if (!customer) return createResponse(422, "No customer found", null);

  return createResponse(200, "Customer Found", {customer});
};
