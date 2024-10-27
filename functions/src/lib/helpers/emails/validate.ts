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
  if (!merchant.apps) {
    console.error("No apps found for merchant.");
    return null;
  }

  const gmail_app = merchant.apps.find((a) => a.name == "gmail");
  if (!gmail_app || !gmail_app.refresh_token) {
    console.error("Gmail app or refresh token not found.");
    return null;
  }

  const isTokenValid = gmail_app.time > Date.now();
  if (isTokenValid) {
    return gmail_app.token;
  }

  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
    oAuth2Client.setCredentials({refresh_token: gmail_app.refresh_token});

    const {credentials} = await oAuth2Client.refreshAccessToken();
    const new_token = credentials.access_token;
    const exp_date = credentials.expiry_date;

    if (!new_token || !exp_date) {
      console.error(
        "Failed to refresh token - missing new access token or expiry date.",
      );
      return null;
    }

    gmail_app.token = new_token;
    gmail_app.time = exp_date;
    await updateRootDocument("shopify_merchant", merchant.id, merchant);

    console.log("Access token refreshed successfully.");
    return new_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
};
