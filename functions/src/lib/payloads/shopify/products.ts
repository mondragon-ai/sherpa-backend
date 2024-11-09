import {
  CleanedNodeProduct,
  CleanedSingleVariant,
  ProductEdge,
  ProductVariantsResponse,
} from "../../types/shopify/products";

export const cleanSearchedProductsPayload = (nodes: ProductEdge[]) => {
  const cleaned: CleanedNodeProduct[] = [];
  for (const n of nodes) {
    cleaned.push({
      title: n.node.title,
      image: n.node.media.edges[0].node.preview.image.url,
      id: n.node.id,
      track_inventory: n.node.tracksInventory,
      url: n.node.onlineStorePreviewUrl,
      status: n.node.status,
      stock_level: n.node.totalInventory,
    });
  }
  return cleaned;
};

export const extractVariantsFromProductSearch = (
  product: ProductVariantsResponse["data"]["product"],
) => {
  const cleaned: CleanedSingleVariant[] = [];
  for (const n of product.variants.edges) {
    cleaned.push({
      title: n.node.title,
      variant_id: n.node.id,
    });
  }
  return cleaned;
};
