import {shopifyGraphQlRequest} from ".";
import {
  cleanCustomerOrderPayload,
  cleanCustomerOrdersPayload,
  cleanOrderEditPayload,
} from "../../lib/payloads/shopify/orders";
import {ChatDocument} from "../../lib/types/chats";
import {EmailDocument} from "../../lib/types/emails";
import {MerchantDocument} from "../../lib/types/merchant";
import {
  CleanedCustomerOrder,
  CleanedOrderEdit,
  NewShippingAddress,
  OrderCancelResponse,
  OrderEditBeginResponse,
  OrderEditSetQuantityResponse,
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

  console.log({order_name: products.orders.edges});
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

  const query = `
  mutation beginOrderEdit{
    orderEditBegin(id: "gid://shopify/Order/6303030083893"){
      calculatedOrder{
        id
        lineItems(first: 20) {
          edges {
            node {
              id
              quantity
              variant {
                id
              }
            }
          }
        }
      }
    }
  }`;

  const shop = merchant.id.split(".")[0];
  const shpat = await decryptMsg(merchant.access_token);
  const response = await shopifyGraphQlRequest(shop, shpat, {query});
  const data = response.data as OrderEditBeginResponse;

  if (!data.orderEditBegin.calculatedOrder) {
    console.error(data.orderEditBegin);
    return null;
  }

  const order_edit = cleanOrderEditPayload(data);

  return order_edit;
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

  if (!data.orderUpdate.order.id) {
    return {performed: false, action: "", error: "change_address"};
  }

  const {address1, city, provinceCode, countryCode, zip} = newShippingAddress;
  const address = `${address1}, ${city}, ${provinceCode}, ${countryCode} ${zip}`;

  return {performed: true, action: address, error: ""};
};

export const removeVariantFromOrder = async (
  merchant: MerchantDocument,
  order_edit: CleanedOrderEdit,
  calc_line_item: CleanedOrderEdit["line_items"][0],
) => {
  const query = `
  mutation removeLineItem {
    orderEditSetQuantity(id: "${order_edit.id}", lineItemId: "${calc_line_item.calclulated_id}", quantity: 0) {
      calculatedOrder {
        id
        lineItems(first: 5) {
          edges {
            node {
              id
              quantity
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`;

  const shop = merchant.id.split(".")[0];
  const shpat = await decryptMsg(merchant.access_token);
  const response = await shopifyGraphQlRequest(shop, shpat, {query});
  const data = response.data as OrderEditSetQuantityResponse;

  if (!data.orderEditSetQuantity.calculatedOrder) {
    console.error(data.orderEditSetQuantity.userErrors);
    return null;
  }

  const line_items = data.orderEditSetQuantity.calculatedOrder.lineItems.edges;

  const item = line_items.find(
    (l) => l.node.id == calc_line_item.calclulated_id,
  );

  if (item && item?.node.quantity > 0) {
    return null;
  }

  return data.orderEditSetQuantity.calculatedOrder.id;
};

export const addVariantToOrder = async (
  merchant: MerchantDocument,
  order_edit: CleanedOrderEdit,
  variant_id: string,
) => {
  const query = `
  mutation addVariantToOrder{
    orderEditAddVariant(id: "${order_edit.id}", variantId: "${variant_id}", quantity: 1){
      calculatedOrder {
        id
        addedLineItems(first:5) {
          edges {
            node {
              id
              quantity
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`;

  const shop = merchant.id.split(".")[0];
  const shpat = await decryptMsg(merchant.access_token);
  const response = await shopifyGraphQlRequest(shop, shpat, {query});
  const data = response.data as OrderEditSetQuantityResponse;

  console.log({added: data});
  return data;
};
