import {
  fetchRootDocument,
  updateRootDocument,
} from "../../../database/firestore";
import {MerchantDocument} from "../../../lib/types/merchant";
import {createResponse} from "../../../util/errors";
import {getCurrentUnixTimeStampFromTimezone} from "../../../util/formatters/time";

export const saveToken = async (domain: string, token: string) => {
  if (!domain) return createResponse(400, "Missing Domain", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;

  const recharge = merchant.apps.some((a) => a.name === "recharge");
  if (recharge) return createResponse(409, "Already Linked", null);

  merchant.updated_at = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  merchant.apps = [
    ...merchant.apps,
    {
      name: "recharge",
      time: 1000000000000,
      token: token,
      refresh_token: token,
      connected: true,
      email: "",
    },
  ];

  await updateRootDocument("shopify_merchant", merchant.id, merchant);

  return createResponse(200, "Saved Recharge", null);
};

export const removeToken = async (domain: string) => {
  if (!domain) return createResponse(400, "Missing Domain", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;

  merchant.updated_at = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
  const apps = merchant.apps.filter((a) => a.name !== "recharge");
  merchant.apps = apps;
  await updateRootDocument("shopify_merchant", merchant.id, merchant);

  return createResponse(200, "Removed Recharge", null);
};
