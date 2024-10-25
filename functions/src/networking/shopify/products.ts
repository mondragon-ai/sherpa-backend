import {shopifyGraphQlRequest} from ".";
import {cleanSearchedProductsPayload} from "../../lib/payloads/shopify/products";
import {
  CleanedNodeProduct,
  ShopifyProductsResponse,
} from "../../lib/types/shopify/products";

export const fetchShopifyProducts = async (
  domain: string,
  shpat: string,
  search: string,
): Promise<CleanedNodeProduct[] | null> => {
  const shop = domain.split(".")[0];

  const query = `
      query ProductSearch($searchQuery: String!) {
        products(first: 10, query: $searchQuery) {
          edges {
            node {
              id
              title
              status
              totalInventory
              onlineStorePreviewUrl
              media(first: 1) {
                edges {
                  node {
                    preview {
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `;

  const variables = {
    searchQuery: search,
  };

  const {data} = await shopifyGraphQlRequest(shop, shpat, {query, variables});
  const products = data as ShopifyProductsResponse["data"];

  if (!products.products) {
    return null;
  }

  if (!products.products.edges) return null;

  const cleaned_products = cleanSearchedProductsPayload(
    products.products.edges,
  );

  return cleaned_products;
};
