export type AppInstallationResponse = {
  data: {
    currentAppInstallation: {
      activeSubscriptions: AppSubscription[];
    };
  };
  extensions: {
    cost: Cost;
  };
};

export type AppSubscription = {
  id: string;
  name: string;
  lineItems: AppSubscriptionLineItem[];
};

export type AppSubscriptionLineItem = {
  id: string;
  plan: Plan;
};

export type Plan = {
  pricingDetails: PricingDetails;
};

export type PricingDetails = {
  __typename: string;
  terms: string;
  balanceUsed: Amount;
  cappedAmount: Amount;
};

export type Amount = {
  amount: string;
};

export type SubscriptionLineItem = {
  balance: number;
  limit: number;
  id: string;
};

export type AppUsageRecordResponse = {
  data: {
    appUsageRecordCreate: AppUsageRecordCreate;
  };
  extensions: {
    cost: Cost;
  };
};

export type AppUsageRecordCreate = {
  appUsageRecord: {
    id: string;
  };
  userErrors: UserError[];
};

export type UserError = {
  field?: string[];
  message: string;
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
