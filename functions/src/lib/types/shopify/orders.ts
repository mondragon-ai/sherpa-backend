export type ShopifyOrdersResponse = {
  data: {
    orders: Orders;
  };
  extensions: {
    cost: Cost;
  };
};

export type Orders = {
  edges: OrderEdge[];
};

export type OrderEdge = {
  node: OrderNode;
};

export type OrderNode = {
  id: string;
  name: string;
  displayFulfillmentStatus: string;
  originalTotalPriceSet: PriceSet;
};

export type PriceSet = {
  presentmentMoney: Money;
};

export type Money = {
  amount: string;
};

export type Cost = {
  requestedQueryCost: number;
  actualQueryCost: number;
  throttleStatus: ThrottleStatus;
};

export type ThrottleStatus = {
  maximumAvailable: number;
  currentlyAvailable: number;
  restoreRate: number;
};

export type CleanedOrderList = {
  name: string;
  id: string;
  fulfillment_status: string;
  price: string;
};

// ! SINGLE ORDER
// * =============================================================================

export type ShopifOrderResponse = {
  data: {
    order: ShopifyOrder;
  };
  extensions: {
    cost: Cost;
  };
};

export type ShopifyOrder = {
  id: string;
  email: string;
  totalPriceSet: PriceSet;
  refunds: any[];
  name: string;
  createdAt: string;
  displayFinancialStatus: string;
  displayFulfillmentStatus: string;
  returnStatus: string;
  fulfillments: Fulfillment[];
  lineItems: LineItems;
};

export type Fulfillment = {
  trackingInfo: TrackingInfo[];
};

export type TrackingInfo = {
  url: string;
};

export type LineItems = {
  edges: LineItemEdge[];
};

export type LineItemEdge = {
  node: LineItemNode;
};

export type LineItemNode = {
  variant: Variant;
  variantTitle: string;
  title: string;
  quantity: number;
};

export type Variant = {
  id: string;
};

export type CleanedCustomerOrder = {
  tracking_url: string;
  order_number: string;
  order_id: string;
  payment_status: string;
  fulfillment_status: string;
  line_items: CleanedLineItems[];
  created_at: number;
  current_total_price: string;
  email: string;
};

export type CleanedLineItems = {
  variant_id: string;
  options: string;
  title: string;
  quantity: number;
};
