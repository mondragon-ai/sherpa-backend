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
  node: ShopifyOrder;
};

// export type OrderNode = {
//   id: string;
//   name: string;
//   displayFulfillmentStatus: string;
//   originalTotalPriceSet: PriceSet;
// };

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
  product: {
    id: string;
  };
  image: {
    url: string;
  };
  requiresShipping: boolean;
  sellingPlan: null | any;
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
  id?: string;
};

export type CleanedLineItems = {
  variant_id: string;
  options: string;
  title: string;
  quantity: number;
  product_id: string;
  image: string;
  selling_plan?: null | any;
  is_physical: boolean;
};

export type OrderCancelResponse = {
  orderCancel: {
    job: null | string;
    orderCancelUserErrors: {
      message: string;
    }[];
    userErrors: {
      field: string[];
      message: string;
    }[];
  };
};
export type OrderEditBeginResponse = {
  orderEditBegin: {
    calculatedOrder: {
      id: string; // e.g., 'gid://shopify/CalculatedOrder/120454021429'
      lineItems: {
        edges: OrderEditNode[];
      };
    };
  };
};

export type OrderEditNode = {
  node: {
    id: string; // e.g., 'gid://shopify/CalculatedLineItem/15905723416885'
    quantity: number;
    variant: {
      id: string; // e.g., 'gid://shopify/ProductVariant/50007230906677'
    };
  };
};

export type CleanedOrderEdit = {
  id: string;
  line_items: {
    calclulated_id: string;
    variant_id: string;
    quantity: number;
  }[];
};

export type OrderEditSetQuantityResponse = {
  orderEditSetQuantity: {
    calculatedOrder: {
      id: string; // e.g., 'gid://shopify/CalculatedOrder/120455889205'
      lineItems: {
        edges: {
          node: {
            id: string; // e.g., 'gid://shopify/CalculatedLineItem/15905723416885'
            quantity: number;
          };
        }[];
      };
    };
    userErrors: {
      message: string;
      field?: string[];
    }[];
  };
};

export type NewShippingAddress = {
  address1: string;
  address2?: string;
  city: string;
  company?: string;
  country: string;
  countryCode: string;
  firstName: string;
  lastName: string;
  phone?: string;
  province: string;
  provinceCode: string;
  zip: string;
};

export type OrderUpdateResponse = {
  orderUpdate: {
    order: {
      id: string; // e.g., 'gid://shopify/Order/6302594072885'
      shippingAddress: {
        address1: string;
        address2: string | null;
        city: string;
        company: string | null;
        countryCode: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        provinceCode: string;
        zip: string;
      };
    };
    userErrors: {message: string; field?: string[]}[];
  };
};
