import {fetchRootDocument} from "../../../database/firestore";
import {MerchantDocument} from "../../../lib/types/merchant";
import {fetchShopifyCustomer} from "../../../networking/shopify/customers";
import {fetchCustomerOrderList} from "../../../networking/shopify/orders";
import {fetchShopifyProducts} from "../../../networking/shopify/products";
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

export const fetchCustomerOrders = async (domain: string, email: string) => {
  if (!domain || !email) return createResponse(400, "Missing params", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "No merchant found", null);

  const shpat = await decryptMsg(merchant.access_token);
  const customer = await fetchShopifyCustomer(domain, shpat, email);
  if (!customer) return createResponse(422, "No customer found", null);

  const customer_id = customer.id;
  const orders = await fetchCustomerOrderList(domain, shpat, customer_id);
  if (!orders) return createResponse(422, "No orders found", null);

  return createResponse(200, "Orders Found", {orders});
};

export const searchProduct = async (domain: string, query: string) => {
  if (!domain || !query) return createResponse(400, "Missing params", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "No merchant found", null);

  const shpat = await decryptMsg(merchant.access_token);
  const products = await fetchShopifyProducts(domain, shpat, query);
  if (!products) return createResponse(422, "No products found", null);

  return createResponse(200, "Products Found", {products});
};
