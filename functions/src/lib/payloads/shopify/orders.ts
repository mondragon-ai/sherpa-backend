import {
  CleanedCustomerOrder,
  CleanedOrderList,
  OrderEdge,
  ShopifyOrder,
} from "../../types/shopify/orders";

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

export const cleanCustomerOrderPayload = (order: ShopifyOrder) => {
  const tracking =
    order.fulfillments[0] && order.fulfillments[0].trackingInfo[0]
      ? order.fulfillments[0].trackingInfo[0].url
      : "";

  const line_items = (order.lineItems.edges || []).map((li) => ({
    title: li.node.title || "",
    variant_id: li.node.variant.id || "",
    options: li.node.variantTitle || "",
    quantity: li.node.quantity || "",
  }));

  const time_stamp = new Date(order.createdAt).getSeconds();

  return {
    tracking_url: tracking,
    order_number: order.name || "",
    order_id: order.id || "",
    payment_status: order.displayFinancialStatus || "",
    fulfillment_status: order.displayFulfillmentStatus || "",
    line_items: line_items,
    created_at: time_stamp,
    current_total_price: order.totalPriceSet.presentmentMoney.amount || "",
    email: order.email || "",
  } as CleanedCustomerOrder;
};
