import {
  CleanedCustomerOrder,
  CleanedOrderEdit,
  OrderEdge,
  OrderEditBeginResponse,
  ShopifyOrder,
} from "../../types/shopify/orders";

export const cleanCustomerOrdersPayload = (nodes: OrderEdge[]) => {
  const cleaned: CleanedCustomerOrder[] = [];
  for (const n of nodes) {
    const fulfillments = n.node.fulfillments && n.node.fulfillments.length;
    let tracking = "";

    if (fulfillments) {
      for (const full of n.node.fulfillments) {
        if (full.trackingInfo.length && full.trackingInfo[0].url) {
          tracking = full.trackingInfo[0].url;
        }
      }
    }
    // const tracking =
    //   n.node.fulfillments[0] && n.node.fulfillments[0].trackingInfo[0]
    //     ? n.node.fulfillments[0].trackingInfo[0].url
    //     : "";

    const line_items = (n.node.lineItems.edges || []).map((li) => ({
      title: li.node.title || "",
      variant_id: li.node.variant && li.node ? li.node.variant.id : "",
      options: li.node.variantTitle || "",
      quantity: li.node.quantity || 0,
      product_id: li.node && li.node.product ? li.node.product.id : "",
      image:
        li?.node?.image?.url ||
        "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?v=1530129081",
      selling_plan: li.node.sellingPlan || null,
      is_physical: li.node.requiresShipping,
    }));

    // const time_stamp = new Date(n.node.createdAt).getSeconds();
    const date = new Date(n.node.createdAt);
    const time_stamp = Math.floor(date.getTime() / 1000);
    cleaned.push({
      tracking_url: tracking,
      order_number: n.node.name || "",
      order_id: n.node.id || "",
      payment_status: n.node.displayFinancialStatus || "",
      fulfillment_status: n.node.displayFulfillmentStatus || "",
      line_items: line_items,
      created_at: time_stamp,
      current_total_price:
        (n.node as any).originalTotalPriceSet.presentmentMoney.amount ||
        n.node.totalPriceSet.presentmentMoney.amount ||
        "0.00",
      email: n.node.email || "",
      id: n.node.id,
    });
  }
  return cleaned;
};

export const cleanCustomerOrderPayload = (order: ShopifyOrder) => {
  const fulfillments = order.fulfillments && order.fulfillments.length;
  let tracking = "";

  if (fulfillments) {
    for (const full of order.fulfillments) {
      if (full.trackingInfo.length && full.trackingInfo[0].url) {
        tracking = full.trackingInfo[0].url;
      }
    }
  }

  const line_items = (order.lineItems.edges || []).map((li) => ({
    title: li.node.title || "",
    variant_id: li.node && li.node.variant ? li.node.variant.id : "",
    options: li.node.variantTitle || "",
    quantity: li.node.quantity || "",
    product_id: li.node && li.node.product ? li.node.product.id : "",
    image:
      li?.node?.image?.url ||
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?v=1530129081",
    selling_plan: li.node.sellingPlan || null,
    is_physical: li.node.requiresShipping,
  }));

  const date = new Date(order.createdAt);
  const time_stamp = Math.floor(date.getTime() / 1000);

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

export const cleanOrderEditPayload = (
  order_edit: OrderEditBeginResponse,
): CleanedOrderEdit => {
  const order_edited = {
    id: order_edit.orderEditBegin.calculatedOrder.id,
    line_items: [] as {
      calclulated_id: string;
      variant_id: string;
      quantity: number;
    }[],
  };

  const line_items = order_edit.orderEditBegin.calculatedOrder.lineItems;

  for (const li of line_items.edges) {
    const line_item = {
      calclulated_id: li.node.id,
      variant_id: li.node.variant.id,
      quantity: li.node.quantity,
    };
    order_edited.line_items.push(line_item);
  }
  return order_edited;
};
