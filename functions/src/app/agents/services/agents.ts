import {fetchRootDocument} from "../../../database/firestore";
import {ChatStartRequest} from "../../../lib/types/chats";
import {MerchantDocument} from "../../../lib/types/merchant";
import {updateMerchantUsage} from "../../../networking/shopify/billing";
import {fetchShopifyCustomer} from "../../../networking/shopify/customers";
import {
  fetchCustomerOrderList,
  fetchShopifyOrder,
} from "../../../networking/shopify/orders";
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

export const startChat = async (
  domain: string,
  email: string,
  payload: ChatStartRequest,
) => {
  if (!domain || !payload) return createResponse(400, "Missing params", null);
  const {issue} = payload;

  if (issue !== "general" && !email) {
    return createResponse(400, "Email required", null);
  }

  // Fetch Merchant
  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "No merchant found", null);

  // Update Merchant Usage
  const response = await updateMerchantUsage(domain, merchant);
  if (response.capped || !response.charged) {
    return createResponse(429, "Could not charge merchant", null);
  }

  // TODO: Fetch customer & order (1-3) -> {customer: null | Customer, order: null | Order}
  const {customer, order} = await fetchCustomerData(merchant, payload);

  console.log(customer, order);
  // TODO: Validate order & email

  // TODO: Find if chat exists (1) -> chat_doc | null

  // TODO: Create payload -> payload

  // TODO: Inital Chat

  // TODO: Update/Save payload (1)

  return createResponse(200, "Chat Started", {chat: null});
};

export const fetchCustomerData = async (
  merchant: MerchantDocument,
  payload: ChatStartRequest,
) => {
  const {id: domain, access_token} = merchant;
  const {email, order_id} = payload;

  const shpat = await decryptMsg(access_token);
  const customer = await fetchShopifyCustomer(domain, shpat, email);
  if (!customer) return {customer: null, order: null};

  const customer_id = customer.id;
  const last_order = customer.last_order_id;

  let order;
  if (last_order) {
    order = await fetchShopifyOrder(domain, shpat, order_id);
  }
  console.log(order);

  const orders = await fetchCustomerOrderList(domain, shpat, customer_id);
  if (!orders) return {customer: customer, order: null};
  return {customer: null, order: null};
};
