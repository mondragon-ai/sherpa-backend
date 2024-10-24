import {
  fetchRootDocument,
  updateRootDocument,
} from "../../../database/firestore";
import {createResponse} from "../../../util/errors";
import {
  ConfigurationsType,
  MerchantDocument,
} from "../../../lib/types/merchant";
import {getCurrentUnixTimeStampFromTimezone} from "../../../util/formatters/time";

export const fetchConfigs = async (domain: string) => {
  if (!domain) return createResponse(400, "Missing Domain", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "No merchant found", null);

  // TODO: Clean & send config only

  return createResponse(200, "Fetched merchant", merchant);
};

export const updateConfigs = async (
  domain: string,
  payload: ConfigurationsType,
) => {
  if (!domain || !payload) return createResponse(400, "Missing params", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "No merchant found", null);

  merchant.configurations = payload;
  merchant.updated_at = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  await updateRootDocument("shopify_merchant", domain, merchant);

  return createResponse(200, "Update Bot's Confiurations", null);
};
