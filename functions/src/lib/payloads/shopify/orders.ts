import {CleanedOrderList, OrderEdge} from "../../types/shopify/orders";

export const cleanCustomerOrdersPayload = (nodes: OrderEdge[]) => {
  const cleaned: CleanedOrderList[] = [];
  for (const n of nodes) {
    cleaned.push({
      name: n.node.name,
      id: n.node.id,
      fulfillment_status: n.node.displayFulfillmentStatus,
      price: n.node.originalTotalPriceSet.presentmentMoney.amount,
    });
  }
  return cleaned;
};
