type RechargeCustomer = {
  accepts_marketing: number;
  analytics_data: {
    utm_params: any[];
  };
  billing_address1: string;
  billing_address2: null | string;
  billing_city: string;
  billing_company: null | string;
  billing_country: string;
  billing_phone: string;
  billing_province: string;
  billing_zip: string;
  created_at: string;
  email: string;
  first_charge_processed_at: string;
  first_name: string;
  has_card_error_in_dunning: boolean;
  has_valid_payment_method: boolean;
  hash: string;
  id: number;
  last_name: string;
  number_active_subscriptions: number;
  number_subscriptions: number;
  phone: string;
  processor_type: string;
  reason_payment_method_not_valid: null | string;
  shopify_customer_id: string;
  status: string;
  tax_exempt: boolean;
  updated_at: string;
};

export type RechargeCustomers = {
  customers: RechargeCustomer[];
};
