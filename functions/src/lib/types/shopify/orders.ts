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
