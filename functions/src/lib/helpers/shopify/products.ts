import {findCorrectVariantFromProduct} from "../../../networking/openAi/extraction";
import {removeVariantFromOrder} from "../../../networking/shopify/orders";
import {searchProductById} from "../../../networking/shopify/products";
import {ChangeProductLineItem} from "../../types/openai/products";
import {decryptMsg} from "../../../util/encryption";
import {MerchantDocument} from "../../types/merchant";
import {CleanedOrderEdit} from "../../types/shopify/orders";
import {cleanGPTResponse} from "../../../util/formatters/text";

export const fetchRequestedProducts = async (
  line_items: ChangeProductLineItem[] | null,
  merchant: MerchantDocument,
  order_edit: CleanedOrderEdit,
): Promise<{variant_id: string; quantity: number}[] | null> => {
  if (!line_items) return null;

  const {id, access_token} = merchant;
  const shpat = await decryptMsg(access_token);

  const variants = [] as {variant_id: string; quantity: number}[];

  for (const li of line_items) {
    if (!li.variant_id) {
      console.error("No Variant ID");
      continue;
    }

    if (li.product_id && li.variant_id) {
      const product = await searchProductById(id, shpat, li.product_id);
      if (!product) {
        console.error("No Product Found", li.product_id);
        continue;
      }

      // FIND CORRECT Variant ID
      const gpt_repsonse = await findCorrectVariantFromProduct(product, li);
      if (!gpt_repsonse) {
        console.error("Coundl't Find from Products", li);
        continue;
      }

      try {
        const variant = (await JSON.parse(cleanGPTResponse(gpt_repsonse))) as {
          variant_id: string;
          quantity: number;
        };

        const calc_line_item = order_edit.line_items.find(
          (ol) => ol.variant_id == li.variant_id,
        );
        if (!calc_line_item) {
          console.error("Couldn't Find order edit ID", order_edit.line_items);
          continue;
        }

        const removed = await removeVariantFromOrder(
          merchant,
          order_edit,
          calc_line_item,
        );
        if (!removed) {
          console.error("Couldn't Remove Product: Likely POD product");
          continue;
        }
        variants.push(variant);
      } catch (error) {
        console.error("COUDLNT PARSE VARIANTS FROM GPT:", error);
        continue;
      }
    }
  }

  return variants;
};
