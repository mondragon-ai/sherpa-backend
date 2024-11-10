import {GmailTokenData} from "./gmail/auth";

export type Status =
  | 500
  | 422
  | 403
  | 409
  | 401
  | 400
  | 404
  | 422
  | 429
  | 200
  | 201
  | 203
  | 204;

export type ServicesReponseType = {
  status: Status;
  data: any;
  message: string;
};

export interface Address {
  type: "BOTH" | "SHIPPING" | "BILLING";
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  name: string;
  title?: string;
  phone?: string;
}

export interface ShippingLines {
  id: string;
  title: string;
  price: number;
  custom?: true;
}

export type IssueTypes =
  | "order"
  | "refund"
  | "general"
  | "subscription"
  | "shipping"
  | "exchange";

export enum ClassificationTypes {
  OrderStatus = "ORDER_STATUS",
  Subscription = "SUBSCRIPTION",
  Giveaway = "GIVEAWAY",
  OrderAddress = "ORDER_ADDRESS",
  General = "GENERAL",
  Discount = "DISCOUNT",
  OrderCancellation = "ORDER_CANCELLATION",
  OrderModification = "ORDER_MODIFICATION",
  OrderRefund = "ORDER_REFUND",
  Product = "PRODUCT",
  None = "",
}

export type RatingTypes = "positive" | "neutral" | "negative";

export type SuggestedActions =
  | "resolve"
  | "change_product"
  | "exchange"
  | "change_address"
  | "cancel_order"
  | "apply_discount"
  | "unknown"
  | "cancel_subscription";

export type CustomerData = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  tags: string;
  total_spent: number;
  total_orders: number;
  address: string;
};

export type Conversation = {
  time: number;
  is_note: boolean;
  message: string;
  sender: "agent" | "customer" | "email";
  action: null | "closed" | "opened";
};

export type OrderData = {
  id: string;
  order_id: string;
  current_total_price: string;
  fulfillment_status:
    | "hold"
    | "on_hold"
    | "shipped"
    | "delivered"
    | "pending"
    | "open"
    | "fulfilled"
    | "transit"
    | "in_progress"
    | "scheduled"
    | "unfulfilled";
  payment_status: "hold" | "paid";
  tracking_url: string;
  order_number: number;
  created_at: number;
  line_items: LineItem[];
  email: string;
};

export type LineItem = {
  quantity: number;
  options: string;
  title: string;
  product_id: string;
  variant_id: string;
  image: string;
  selling_plan?: null | any;
};

export type OAuthResponse = {
  data: GmailTokenData;
  message: string;
};

export type AlgoliaSearchType = {
  id: string;
  first_name: string;
  lasst_name: string;
  email: string;
  issue: string;
  status: string;
  suggested_action: string;
  classification: string;
};
