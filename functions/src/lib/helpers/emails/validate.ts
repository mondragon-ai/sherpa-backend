import {google} from "googleapis";
import {MerchantDocument} from "../../types/merchant";
import {updateRootDocument} from "../../../database/firestore";

/**
 * Check if token is expired, refresh if necessary, and return a valid access token
 * @param {MerchantDocument} merchant - Domain associated with the user's tokens
 * @returns {Promise<string | null>} - A valid access token
 */
export const getValidGmailAccessToken = async (
  merchant: MerchantDocument,
): Promise<string | null> => {
  const gmail_app = merchant.apps.find((a) => a.name == "gmail");
  if (!gmail_app) return null;

  const isTokenValid = gmail_app.time > Date.now();
  if (isTokenValid) return gmail_app.token;

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
  oAuth2Client.setCredentials({refresh_token: gmail_app.refresh_token});

  const {credentials} = await oAuth2Client.refreshAccessToken();
  const new_token = credentials.access_token;
  const exp_date = credentials.expiry_date;
  if (!new_token || !exp_date) return null;

  gmail_app.token = new_token || "";
  gmail_app.time = exp_date || 0;
  await updateRootDocument("shopify_merchant", merchant.id, merchant);

  return new_token;
};
