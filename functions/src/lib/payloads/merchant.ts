import {getCurrentUnixTimeStampFromTimezone} from "../../util/formatters/time";
import {MerchantDocument} from "../types/merchant";
import {ShopData} from "../types/shopify/shop";

// Utility function to split full name into first and last names
const splitName = (fullName: string): {firstName: string; lastName: string} => {
  const [firstName, ...lastName] = fullName.split(" ");
  return {
    firstName: firstName || "",
    lastName: lastName.join(" ") || "",
  };
};

/**
 * Constructs a Shopify merchant payload with specified store details and webhook configurations.
 * @param {string} token - Access token for the Shopify API.
 * @param {{shop_update: number; complete_order_id: number;}} webhooks - Webhook IDs for shop updates and complete orders.
 * @param {ShopData} store - Shop data including owner, email, phone, domain, and address details.
 * @returns {MerchantDocument} A structured MerchantDocument object containing comprehensive shop details, owner info, and webhook configurations.
 */
export const merchantPayload = (
  token: string,
  webhooks: {
    shop: number;
    order: number;
  },
  store: ShopData,
): MerchantDocument => {
  const {firstName, lastName} = splitName(store.shop_owner);

  const currentTime = getCurrentUnixTimeStampFromTimezone(store.timezone);

  return {
    capped_usage: 5000,
    state: currentTime,
    created_at: currentTime,
    updated_at: currentTime,
    owner: {
      email: store.email || "",
      first_name: firstName,
      last_name: lastName,
      phone: store.phone || "",
    },
    address: {
      address1: store.address.address1 || "",
      city: store.address.city || "",
      province: store.address.province || "",
      zip: store.address.zip || "",
      country: store.address.country || "",
    },
    installed: true,
    status: "DECLINED",
    usage: 0,
    webhooks: webhooks,
    id: store.domain || "",
    timezone: store.timezone || "",
    access_token: token || "",
    shop_name: store.domain.split(".")[0] || "",
    shop_domain: store.domain || "",
    myshopify_domain: store.myshopify_domain || "",
    apps: [],
    free_trial: true,
    free_chats: 10,
    configurations: {
      cancelation: {
        overview:
          "You cannot cancel orders after shipped, yet we can offer a refund once the item is returned",
        faqs: [],
      },
      products: {
        overview: "All productsa re hand crafted and USA made",
        faqs: [],
      },
      subscriptions: {
        overview: "Subscriptions of $30 are recharge and $9 are stripe",
        faqs: [],
      },
      discounts: {
        overview:
          "We have no special discounts. However, if asked, military members get THANKYOU for 20% off-- ONLY give if asked and they are military.",
        faqs: [],
      },
      giveaway: {
        overview: "No giveaways available at the moment",
        faqs: [],
      },
      special_cases: [
        {
          title: "Special Offer",
          description: "Until 30th of october, we are giving x-off",
        },
      ],
      exception: "perashable goods",
      shipping: "",
      store: "",
      contact_email: store.email || "",
      return: 30,
      exchanges: true,
      refund: true,
      damged_items: true,
      automate_actions: true,
      automate_emails: false,
      price_rules: {
        id: 0,
        title: "",
        value: "",
        value_type: "percentage",
      },
      tone: "standard",
      custom_tone: "",
      links: [],
    },
  } as MerchantDocument;
};
