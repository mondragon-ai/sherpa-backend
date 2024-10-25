import {shopifyGraphQlRequest} from ".";
import {cleanCustomerOrdersPayload} from "../../lib/payloads/shopify/orders";
import {ShopifyOrdersResponse} from "../../lib/types/shopify/orders";

export const fetchCustomerOrderList = async (
  domain: string,
  shpat: string,
  customer_id: number,
): Promise<any[] | null> => {
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

  const cleaned_orders = cleanCustomerOrdersPayload(products.orders.edges);

  return cleaned_orders;
};
