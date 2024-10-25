export type ShopifyCustomerResponse = {
  customer: ShopifyCustomer[];
};

export type ShopifyCustomer = {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id: number;
  note: string | null;
  verified_email: boolean;
  multipass_identifier: string | null;
  tax_exempt: boolean;
  tags: string;
  last_order_name: string;
  currency: string;
  phone: string;
  addresses: Address[];
  tax_exemptions: any[];
  email_marketing_consent: MarketingConsent;
  sms_marketing_consent: SmsMarketingConsent;
  admin_graphql_api_id: string;
  default_address: Address;
};

export type Address = {
  id: number;
  customer_id: number;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
  name: string;
  province_code: string;
  country_code: string;
  country_name: string;
  default: boolean;
};

export type MarketingConsent = {
  state: string;
  opt_in_level: string | null;
  consent_updated_at: string;
};

export type SmsMarketingConsent = {
  state: string;
  opt_in_level: string;
  consent_updated_at: string;
  consent_collected_from: string;
};
