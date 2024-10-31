import {shopifyGraphQlRequest} from ".";
import {
  cleanCustomerOrderPayload,
  cleanCustomerOrdersPayload,
} from "../../lib/payloads/shopify/orders";
import {
  CleanedCustomerOrder,
  ShopifOrderResponse,
  ShopifyOrdersResponse,
} from "../../lib/types/shopify/orders";

export const fetchCustomerOrderList = async (
  domain: string,
  shpat: string,
  customer_id: number,
): Promise<CleanedCustomerOrder[] | null> => {
  const shop = domain.split(".")[0];

  const query = `
    query SearchCustomerOrder($customerId: String!) {
      orders(reverse: true, first: 250, query: $customerId) {
        edges {
          node {
            id
            name
            displayFulfillmentStatus
            originalTotalPriceSet {
              presentmentMoney {
                amount
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    customerId: `customer_id:${customer_id}`,
  };

  const {data} = await shopifyGraphQlRequest(shop, shpat, {query, variables});
  const products = data as ShopifyOrdersResponse["data"];

  if (!products.orders) {
    return null;
  }

  if (!products.orders.edges) return null;

  console.log({order_list: products.orders.edges});

  const cleaned_orders = cleanCustomerOrdersPayload(products.orders.edges);

  return cleaned_orders;
};

export const fetchShopifyOrder = async (
  domain: string,
  shpat: string,
  order_id: string,
) => {
  const query = `
    query fetchCustomerOrder {
        order(id: "gid://shopify/Order/${order_id}") {
            id
            email
            totalPriceSet {
                presentmentMoney {
                    amount
                }
            }
            refunds(first: 100) {
                id
            }
            name
            createdAt
            displayFinancialStatus
            displayFulfillmentStatus
            returnStatus
            fulfillments(first: 100) {
                trackingInfo {
                    url
                }
            } 
            lineItems(first: 100) {
                edges {
                    node {
                        variant {
                            id
                        }
                        variantTitle
                        title
                        quantity
                    }
                }
            }
        }
    }
  `;

  const shop = domain.split(".")[0];
  const {data} = await shopifyGraphQlRequest(shop, shpat, {query});
  if (!data) return null;
  const order = data as ShopifOrderResponse["data"];
  if (!order || !order.order) return null;

  const cleaned_order = cleanCustomerOrderPayload(order.order);

  return cleaned_order;
};

export const fetchShopifyOrderByName = async (
  domain: string,
  shpat: string,
  order_number: string,
) => {
  const query = `
    query SearchCustomerOrder($customerId: String!) {
      orders(reverse: true, first: 250, query: $customerId) {
        edges {
          node {
            id
            email
            refunds(first: 100) {
                id
            }
            name
            createdAt
            displayFinancialStatus
            displayFulfillmentStatus
            originalTotalPriceSet {
              presentmentMoney {
                amount
              }
            }
            fulfillments(first: 100) {
                trackingInfo {
                    url
                }
            } 
            lineItems(first: 100) {
                edges {
                    node {
                        variant {
                            id
                        }
                        variantTitle
                        title
                        quantity
                    }
                }
            }
          }
        }
      }
    }
  `;

  const variables = {
    customerId: `name:${order_number}`,
  };

  const shop = domain.split(".")[0];
  const {data} = await shopifyGraphQlRequest(shop, shpat, {query, variables});
  const products = data as ShopifyOrdersResponse["data"];

  if (!products.orders) return null;
  if (!products.orders.edges) return null;

  console.log({orders: products.orders.edges});
  const cleaned_orders = cleanCustomerOrdersPayload(products.orders.edges);

  return cleaned_orders;
};
