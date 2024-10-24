export type MerchantDocument = {
  capped_usage: number;
  state: number;
  created_at: number;
  updated_at: number;
  owner: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
  address: {
    address1: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
  installed: boolean;
  status: "DECLINED" | "ACTIVE" | "EXPIRED";
  usage: number;
  id: string;
  timezone: string;
  access_token: string;
  shop_name: string;
  shop_domain: string;
  myshopify_domain: string;
  apps: AppTypes[];
  free_trial: boolean;
  free_chats: number;
  configurations: ConfigurationsType;
};

export type AppTypes = {
  name: "gmail" | "outlook" | "stripe" | "recharge";
  token: string;
  connected: boolean;
  email: string;
};

export type ConfigurationsType = {
  cancelation: FAQType;
  products: FAQType;
  subscriptions: FAQType;
  discounts: FAQType;
  giveaway: FAQType;
  special_cases: {title: string; description: string}[];
  exception: string;
  shipping: string;
  store: string;
  contact_email: string;
  return: number;
  exchanges: boolean;
  refund: boolean;
  damged_items: boolean;
  automate_actions: boolean;
  automate_emails: boolean;
  price_rules: {
    id: number;
    title: string;
    value: string;
    value_type: "percentage" | "fixed";
  };
  tone: "standard" | "playful" | "custom";
  custom_tone: string;
  links: LinkType[] | [];
};

export type LinkType = {
  name: string;
  url: string;
};

export type FAQType = {
  overview: string;
  faqs: {q: string; a: string}[];
};

export type FAQTypeNames =
  | "cancelation"
  | "products"
  | "subscriptions"
  | "discounts"
  | "giveaway";

export type ShopifyPolicies = {};
