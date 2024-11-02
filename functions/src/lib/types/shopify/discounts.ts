export interface ShopifyPriceRuleCreate {
  title: string;
  target_type: "line_item" | "shipping_line";
  target_selection: "all" | "entitled";
  customer_selection: "all" | "prerequisite";
  value_type: "fixed_amount" | "percentage";
  value: string;
  starts_at?: string;
  ends_at?: string;
  allocation_method?: "across" | "each";
  allocation_limit: number;
  once_per_customer: boolean;
  prerequisite_collection_ids: number[];
  entitled_product_ids: number[];
}

export interface ShopifyPriceRule extends ShopifyPriceRuleCreate {
  id: number;
  created_at: string;
  updated_at: string;
}

export type DiscountCodeCreateResponse = {
  data: {
    discountCodeBasicCreate: {
      codeDiscountNode: {
        id: string;
        codeDiscount: {
          title: string;
          codes: {
            nodes: Array<{
              id: string;
              code: string;
            }>;
          };
          startsAt: string;
          endsAt: string;
        };
      };
      userErrors: Array<unknown>;
    };
  };
  extensions: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
};

export type DiscountRedeemCodeBulkAddResponse = {
  discountRedeemCodeBulkAdd: {
    bulkCreation: {
      id: string;
    };
    userErrors: {message: string; field?: string[]}[];
  };
};
