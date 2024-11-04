import {shopifyGraphQlRequest} from ".";
import {
  cleanCustomerOrderPayload,
  cleanCustomerOrdersPayload,
} from "../../lib/payloads/shopify/orders";
import {ChatDocument} from "../../lib/types/chats";
import {EmailDocument} from "../../lib/types/emails";
import {MerchantDocument} from "../../lib/types/merchant";
import {
  CleanedCustomerOrder,
  NewShippingAddress,
  OrderCancelResponse,
  OrderEditBeginResponse,
  OrderUpdateResponse,
  ShopifOrderResponse,
  ShopifyOrdersResponse,
} from "../../lib/types/shopify/orders";
import {decryptMsg} from "../../util/encryption";

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
                  product{
                    id
                  }
                }
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
              product {
                id
              }
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
                  product {
                    id
                  }
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

export const cancelOrder = async (
  chat: ChatDocument | EmailDocument,
  merchant: MerchantDocument,
) => {
  const order = chat.order;
  if (!order) return {performed: false, action: "", error: "cancel_order"};

  const query = `mutation orderCancel($orderId: ID!, $reason: OrderCancelReason!, $refund: Boolean!, $restock: Boolean!) {
    orderCancel(orderId: $orderId, reason: $reason, refund: $refund, restock: $restock) {
      job {
        done
      }
      orderCancelUserErrors {
        message
      }
      userErrors {
        field
        message
      }
    }
  }`;

  const variables = {
    notifyCustomer: true,
    orderId: order.order_id,
    reason: "CUSTOMER",
    refund: true,
    restock: true,
    staffNote: "Sherpa Canceled",
  };

  const shop = merchant.id.split(".")[0];
  const shpat = await decryptMsg(merchant.access_token);
  const response = await shopifyGraphQlRequest(shop, shpat, {query, variables});
  const data = response.data as OrderCancelResponse;

  if (!data.orderCancel.job) {
    console.error(data.orderCancel.orderCancelUserErrors[0]);
    return {performed: false, action: "", error: "cancel_order"};
  }

  return {performed: true, action: "", error: ""};
};

export const startOrderEdit = async (
  chat: ChatDocument | EmailDocument,
  merchant: MerchantDocument,
) => {
  const order = chat.order;
  if (!order) return null;

  const query = `mutation beginEdit{
    orderEditBegin(id: "${order.order_id}"){
        calculatedOrder{
          id
        }
      }
    }`;

  const shop = merchant.id.split(".")[0];
  const shpat = await decryptMsg(merchant.access_token);
  const response = await shopifyGraphQlRequest(shop, shpat, {query});
  const data = response.data as OrderEditBeginResponse;

  console.error(data);

  if (!data.orderEditBegin.calculatedOrder) {
    console.error(data.orderEditBegin);
    return null;
  }

  return data.orderEditBegin.calculatedOrder.id;
};

export const updateShippingAddress = async (
  chat: ChatDocument | EmailDocument,
  merchant: MerchantDocument,
  newShippingAddress: NewShippingAddress,
) => {
  const order = chat.order;
  if (!order) return {performed: false, action: "", error: "change_address"};

  const query = `mutation updateOrderShippingAddress($input: OrderInput!) {
    orderUpdate(input: $input) {
      order {
        id
        shippingAddress {
          address1
          address2
          city
          company
          countryCode
          firstName
          lastName
          phone
          provinceCode
          zip
        }
      }
      userErrors {
        message
        field
      }
    }
  }`;

  const variables = {
    input: {
      id: order.order_id,
      shippingAddress: newShippingAddress,
    },
  };

  const shop = merchant.id.split(".")[0];
  const shpat = await decryptMsg(merchant.access_token);
  const response = await shopifyGraphQlRequest(shop, shpat, {query, variables});
  const data = response.data as OrderUpdateResponse;

  console.log({data: data.orderUpdate.order.id});

  if (!data.orderUpdate.order.id) {
    return {performed: false, action: "", error: "change_address"};
  }

  return {performed: true, action: data.orderUpdate.order.id, error: ""};
};
