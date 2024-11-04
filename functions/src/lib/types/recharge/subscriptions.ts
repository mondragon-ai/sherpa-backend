export type RechargeSubscriptionData = {
  subscription: {
    id: number;
    address_id: number;
    customer_id: number;
    analytics_data: {
      utm_params: any[]; // You can specify a more specific type if needed
    };
    cancellation_reason: null | string;
    cancellation_reason_comments: null | string;
    cancelled_at: null | string;
    charge_interval_frequency: string;
    created_at: string;
    expire_after_specific_number_of_charges: null | number;
    external_product_id: {
      ecommerce: string;
    };
    external_variant_id: {
      ecommerce: string;
    };
    has_queued_charges: boolean;
    is_prepaid: boolean;
    is_skippable: boolean;
    is_swappable: boolean;
    max_retries_reached: boolean;
    next_charge_scheduled_at: string;
    order_day_of_month: null | number;
    order_day_of_week: null | string;
    order_interval_frequency: number;
    order_interval_unit: string;
    presentment_currency: string;
    price: number;
    product_title: string;
    properties: {
      name: string;
      value: string;
    }[];
    quantity: number;
    sku: null | string;
    sku_override: boolean;
    status: string;
    updated_at: string;
    variant_title: string;
  };
};

export type RechargeSubscriptionType = {
  address_id: number;
  analytics_data: {
    utm_params: [];
  };
  cancellation_reason: null;
  cancellation_reason_comments: null;
  cancelled_at: null;
  charge_interval_frequency: string;
  created_at: string;
  customer_id: number;
  email: string;
  expire_after_specific_number_of_charges: null;
  has_queued_charges: number;
  id: number;
  is_prepaid: boolean;
  is_skippable: boolean;
  is_swappable: boolean;
  max_retries_reached: number;
  next_charge_scheduled_at: string;
  order_day_of_month: null;
  order_day_of_week: null;
  order_interval_frequency: string;
  order_interval_unit: "day" | string;
  presentment_currency: string;
  price: number;
  product_title: string;
  properties: [];
  quantity: number;
  recharge_product_id: number;
  shopify_product_id: number;
  shopify_variant_id: number;
  sku: string;
  sku_override: boolean;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
  updated_at: string;
  variant_title: string;
};

export type CustomerSubscriptionList = {
  subscriptions: RechargeSubscriptionType[];
};
