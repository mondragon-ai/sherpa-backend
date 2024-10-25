import {CleanedNodeProduct, ProductEdge} from "../../types/shopify/products";

export const cleanSearchedProductsPayload = (nodes: ProductEdge[]) => {
  const cleaned: CleanedNodeProduct[] = [];
  for (const n of nodes) {
    cleaned.push({
      title: n.node.title,
      image: n.node.media.edges[0].node.preview.image.url,
      id: n.node.id,
      url: n.node.onlineStorePreviewUrl,
      status: n.node.status,
      stock_level: n.node.totalInventory,
    });
  }
  return cleaned;
};
