import {findCorrectVariantFromProduct} from "../../../networking/openAi/extraction";
import {searchProductById} from "../../../networking/shopify/products";
import {decryptMsg} from "../../../util/encryption";
import {MerchantDocument} from "../../types/merchant";
import {ChangeProductLineItem} from "../../types/openai/products";

export const fetchRequestedProducts = async (
  line_items: ChangeProductLineItem[] | null,
  merchant: MerchantDocument,
): Promise<{variant_id: string; quantity: number}[] | null> => {
  if (!line_items) return null;

  const {id, access_token} = merchant;
  const shpat = await decryptMsg(access_token);

  const variants = [] as {variant_id: string; quantity: number}[];

  for (const li of line_items) {
    if (!li.variant_id) continue;

    if (li.product_id && li.variant_id) {
      const product = await searchProductById(id, shpat, li.product_id);
      if (!product) continue;

      // FIND CORRECT Variant ID
      const gpt_repsonse = await findCorrectVariantFromProduct(product, li);
      console.log({gpt_repsonse});
      if (!gpt_repsonse) continue;

      try {
        const variant = (await JSON.parse(gpt_repsonse)) as {
          variant_id: string;
          quantity: number;
        };
        console.log({variant});
        variants.push(variant);
      } catch (error) {
        console.error("COUDLNT PARSE VARIANTS FROM GPT:", error);
        continue;
      }
    }
  }

  return variants;
};
