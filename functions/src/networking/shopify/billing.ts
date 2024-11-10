import {
  BILLING_CONFIG,
  USAGE_CHARGE_INCREMENT_AMOUNT,
} from "../../lib/costants";
import {
  AppSubscription,
  AppUsageRecordResponse,
  SubscriptionLineItem,
} from "../../lib/types/shopify/billing";
import {shopifyGraphQlRequest} from ".";
import {decryptMsg} from "../../util/encryption";
import {MerchantDocument} from "../../lib/types/merchant";
import {updateRootDocument} from "../../database/firestore";
import {getCurrentUnixTimeStampFromTimezone} from "../../util/formatters/time";

export const updateMerchantUsage = async (
  domain: string,
  merchant: MerchantDocument,
): Promise<{
  capped: boolean;
  charged: boolean;
}> => {
  const {access_token, free_chats, free_trial, timezone} = merchant;

  // Check if free chats exist
  if (free_trial && free_chats - 1 >= 0) {
    console.log(`${domain}: Free Charge ${free_chats - 1}`);
    merchant.free_chats -= 1;
    if (free_chats - 1 <= 0) {
      merchant.free_trial = false;
    }
    merchant.updated_at = getCurrentUnixTimeStampFromTimezone(timezone);
    await updateRootDocument("shopify_merchant", domain, merchant);
    return {capped: false, charged: true};
  }

  // Create Record
  const shpat = await decryptMsg(access_token);
  const shop = domain.split(".")[0];
  return await createUsageRecord(shop, shpat);
};

export const createUsageRecord = async (
  shop: string,
  shpat: string,
): Promise<{
  capped: boolean;
  charged: boolean;
}> => {
  // Fetch App Sub
  const billing = await fetchBillingLineItems(shop, shpat);
  if (!billing) {
    console.error(`${shop}: No Billing Found`);
    return {capped: false, charged: false};
  }

  // Check if cap limit reached
  if (billing.balance + USAGE_CHARGE_INCREMENT_AMOUNT > billing.limit) {
    console.error(`${shop}: Cap Reached`);
    return {capped: true, charged: false};
  }

  // Attempt Charge
  return attemptCharge(shop, shpat, billing);
};

export const fetchBillingLineItems = async (
  shop: string,
  shpat: string,
): Promise<SubscriptionLineItem | null> => {
  let line_items: SubscriptionLineItem = {} as SubscriptionLineItem;
  const HAS_PAYMENTS_QUERY = {
    query:
      "query appSubscription { currentAppInstallation { activeSubscriptions { id name lineItems { id plan { pricingDetails { __typename ... on AppUsagePricing { terms balanceUsed { amount } cappedAmount { amount } } } } } } } }",
  };

  const {data} = await shopifyGraphQlRequest(shop, shpat, HAS_PAYMENTS_QUERY);
  if (!data) return null;
  const active_subs = data.currentAppInstallation
    .activeSubscriptions as AppSubscription[];
  if (!active_subs) return null;

  for (const sub of active_subs) {
    if (sub.name == BILLING_CONFIG["Pay As You Go"].usageTerms) {
      for (const li of sub.lineItems) {
        const term = li.plan.pricingDetails.terms;
        if (term === BILLING_CONFIG["Pay As You Go"].usageTerms) {
          line_items = {
            id: li.id,
            balance: parseFloat(li.plan.pricingDetails.balanceUsed.amount),
            limit: parseFloat(li.plan.pricingDetails.cappedAmount.amount),
          };
        }
      }
    }
  }

  return line_items;
};

export const attemptCharge = async (
  shop: string,
  shpat: string,
  billing: SubscriptionLineItem,
) => {
  const query = `
    mutation appUsageRecordCreate(
        $description: String!,
        $price: MoneyInput!,
        $subscriptionLineItemId: ID!
    ) {
        appUsageRecordCreate(
            description: $description,
            price: $price,
            subscriptionLineItemId: $subscriptionLineItemId
        ) {
            appUsageRecord { id }
            userErrors { field message }
        }
    }
  `;

  const variables = {
    description: BILLING_CONFIG["Pay As You Go"].usageTerms,
    price: {
      amount: USAGE_CHARGE_INCREMENT_AMOUNT,
      currencyCode: "USD",
    },
    subscriptionLineItemId: billing.id,
  };

  const {data} = await shopifyGraphQlRequest(shop, shpat, {query, variables});
  const charge = data as AppUsageRecordResponse["data"];
  if (!charge) return {capped: false, charged: false};

  if (!charge.appUsageRecordCreate.appUsageRecord.id) {
    console.error(`${shop}: No Billing Found`);
    return {capped: false, charged: false};
  }

  return {capped: false, charged: true};
};
