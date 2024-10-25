import {
  CleanedCustomerPayload,
  ShopifyCustomer,
} from "../../types/shopify/customers";

export const cleanCustomerPayload = (
  customer: ShopifyCustomer,
): CleanedCustomerPayload => {
  const {address1, city, province_code, country_code, zip} =
    customer.default_address;

  return {
    id: customer.id || "",
    email: customer.email || "",
    first_name: customer.first_name || "",
    last_name: customer.last_name || "",
    tags: customer.tags || "",
    address: `${address1}, ${city}, ${province_code}, ${country_code} ${zip}`,
    total_spent: customer.total_spent || "",
    total_orders: customer.orders_count || 0,
  } as CleanedCustomerPayload;
};
