import {shopifyRequest} from ".";
import {
  ShopifyCustomer,
  ShopifyCustomerResponse,
} from "../../lib/types/shopify/customers";

export const fetchShopifyCustomer = async (
  domain: string,
  shpat: string,
  email: string,
): Promise<ShopifyCustomer | null> => {
  const shop = domain.split(".")[0];
  const customer = (await shopifyRequest(
    `customers/search.json?query=email:"${email}"`,
    "GET",
    null,
    shpat,
    shop,
  )) as ShopifyCustomerResponse;

  if (!customer.customer) return null;

  return customer.customer[0];
};
