export type ShopifyProductsResponse = {
  data: {
    products: Products;
  };
  extensions: {
    cost: Cost;
  };
};

export type Products = {
  edges: ProductEdge[];
  pageInfo: PageInfo;
};

export type ProductEdge = {
  node: ProductNode;
  cursor: string;
};

export type ProductNode = {
  id: string;
  title: string;
  status: string;
  totalInventory: number;
  onlineStorePreviewUrl: string;
  media: Media;
};

export type Media = {
  edges: MediaEdge[];
};

export type MediaEdge = {
  node: MediaNode;
};

export type MediaNode = {
  preview: {
    image: {
      url: string;
    };
  };
};

export type PageInfo = {
  hasNextPage: boolean;
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

export type CleanedNodeProduct = {
  title: string;
  image: string;
  id: string;
  url: string;
  status: string;
  stock_level: number;
};

export type CleanedSingleVariant = {
  title: string;
  variant_id: string;
};

export type ProductVariantsResponse = {
  data: {
    product: {
      title: string;
      variants: {
        edges: {
          node: {
            title: string;
            id: string; // e.g., 'gid://shopify/ProductVariant/50007230906677'
          };
        }[];
      };
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
