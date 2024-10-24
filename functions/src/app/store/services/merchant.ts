import {
  createRootDocument,
  fetchRootDocument,
  updateRootDocument,
} from "../../../database/firestore";
import * as admin from "firebase-admin";
import {encryptMsg} from "../../../util/encryption";
import {MerchantDocument} from "../../../lib/types/merchant";
import {merchantPayload} from "../../../lib/payloads/merchant";
import {ServicesReponseType} from "../../../lib/types/shared";
import {fetchShopifyMerchantShop} from "../../../lib/helpers/shopify/shop";
import {getCurrentUnixTimeStampFromTimezone} from "../../../util/formatters/time";
import {createResponse} from "../../../util/errors";

/**
 * Validates the required parameters
 * @param {string} domain - Merchant domain.
 * @param {string} shpat - Shopify access token.
 * @returns {string | null} Error message or null.
 */
const validateInstallAppParams = (
  domain: string,
  shpat: string,
): string | null => {
  if (!domain || domain.trim() === "") return "Merchant domain is required.";
  if (!shpat || shpat.trim() === "") return "SHPAT is required.";
  return null;
};

// ! ====================================================================================================================================
// ! Install
// ! ====================================================================================================================================
/**
 * install app to Shopify merchant
 *
 * @returns {Promise<ServicesReponseType>} An object containing the status, data, error flag, and status text related to the fetch operation.
 */
export const installApp = async (
  domain: string,
  shpat: string,
): Promise<ServicesReponseType> => {
  const shop = domain.split(".")[0];
  const validationError = validateInstallAppParams(domain, shpat);
  if (validationError) {
    return createResponse(400, validationError, null);
  }

  console.log({validationError});
  const token = await encryptMsg(shpat);
  console.log({token});

  try {
    // fetch merchant
    const {data} = await fetchRootDocument("shopify_merchant", domain);
    const merchant = data ? (data as MerchantDocument) : null;
    console.log({merchant});

    if (
      merchant &&
      merchant.installed &&
      merchant &&
      token !== merchant.access_token
    ) {
      console.log("updating...");
      await handleMerchantInstalled(token, domain);
      return createResponse(201, "merchant updated", null);
    } else if (!merchant || !merchant.installed) {
      console.log("installing...");
      return await handleMerchantNotInstalled(shop, shpat, domain, token);
    }

    return createResponse(400, "uncought error", null);
  } catch (error) {
    console.error("Error installing app:", error); // Log error for debugging
    return createResponse(500, "Failed to install app for the merchant.", null);
  }
};

/**
 * Handles the necessary updates when a Shopify merchant has installed an app.
 * This function deletes any existing webhooks and creates new ones, updating the merchant's document with the new information.
 * @param {string} token - New access token.
 * @param {string} domain - The merchant's domain.
 */
const handleMerchantInstalled = async (token: string, domain: string) => {
  await updateRootDocument("shopify_merchant", domain, {
    access_token: token,
    updated_at: admin.firestore.Timestamp.now(),
  });
};

/**
 * Handles the workflow for when a Shopify merchant has not installed the app.
 * This function creates necessary webhooks, fetches the merchant shop data, creates a fulfillment service,
 * and initializes a document for the merchant with all relevant data.
 * @param {string} shop - The merchant's shop name.
 * @param {string} shpat - Shopify API token.
 * @param {string} domain - The merchant's domain.
 * @param {string} token - New access token.
 * @returns {Promise<ServicesReponseType>} - Returns a response object detailing the outcome.
 */
const handleMerchantNotInstalled = async (
  shop: string,
  shpat: string,
  domain: string,
  token: string,
): Promise<ServicesReponseType> => {
  const store = await fetchShopifyMerchantShop(shpat, shop);
  console.log({store});

  const payload = merchantPayload(token, store);
  console.log({payload});

  await createRootDocument("domain_map", domain, {
    myshopify_domain: store.myshopify_domain,
    custom_domain: store.domain,
    id: domain,
  });

  const {status, text} = await createRootDocument(
    "shopify_merchant",
    domain,
    payload,
  );

  if (status < 300) {
    return createResponse(
      status,
      "Merchant could not be saved successfully - " + text,
      null,
    );
  }

  return createResponse(
    200,
    "App installed for Merchant successfully",
    payload,
  );
};

// ! ====================================================================================================================================
// ! Billing
// ! ====================================================================================================================================

/**
 * Validates the required parameters for billing
 * @param {string} domain - Merchant domain.
 * @returns {string | null} Error message or null.
 */
const validateBillingParams = (domain: string): string | null => {
  if (!domain || domain.trim() === "") return "Merchant domain is required.";
  return null;
};

/**
 * Update the billing for the app (approve the app or increase cap monthly limit)
 *
 * @param {string} domain - The domain identifier for the merchant.
 * @param {"DECLINED" | "ACTIVE" | "EXPIRED"} payent_status - App payment status.
 * @param {nujmber} capped_limit - Updated cappage limit for billing.
 * @returns {Promise<ServicesReponseType>} An object containing the status, error flag, and status text related to the delete operation.
 */
export const updateBilling = async (
  domain: string,
  payent_status: "DECLINED" | "ACTIVE" | "EXPIRED",
  capped_limit: number,
): Promise<ServicesReponseType> => {
  const validationError = validateBillingParams(domain);
  if (validationError) {
    return createResponse(400, validationError, null);
  }

  const currentTime = getCurrentUnixTimeStampFromTimezone("America/New_York");

  try {
    // Perform billing update tasks
    const {status, text} = await updateRootDocument(
      "shopify_merchant",
      domain,
      {
        status: payent_status ?? "DECLINED",
        capped_usage: capped_limit,
        updated_at: currentTime,
      },
    );

    if (status < 300) {
      return createResponse(
        status,
        "Failed to update billing for the merchant." + text,
        null,
      );
    }
    return createResponse(
      204,
      "App billing for Merchant updated successfully",
      null,
    );
  } catch (error) {
    console.error("Error updating billing:", error);
    return createResponse(
      500,
      "Failed to update billing for the merchant.",
      null,
    );
  }
};
