import fetch from "node-fetch";
import * as functions from "firebase-functions";

const URL = "https://api.openai.com/v1";
const open_normal_HEADERS = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + process.env.OPEN_API_KEY,
};

/**
 * Makes an asynchronous HTTP request to a specified resource using the provided method and data.
 *
 * @param {string} resource - The resource URL to make the request to.
 * @param {string} method - The HTTP method for the request (e.g., "GET", "POST", "PUT", "DELETE").
 * @param {any} data - The data to include in the request body (if applicable).
 * @param _header_token
 * @returns {Promise<{
 *   text: string;
 *   status: number;
 *   data: unknown;
 * }>} - A Promise that resolves to an object containing the response details.
 */
export const davinciRequests = async (
  resource: string,
  method: string,
  data: object,
  _header_token?: string,
): Promise<{
  text: string;
  status: number;
  data: unknown;
}> => {
  const requestOptions: {
    headers: {[key: string]: string};
    method: string;
    body?: string;
  } = {
    method: method || "GET",
    headers: open_normal_HEADERS,
  };

  if (method !== "GET" && data) {
    requestOptions.body = JSON.stringify(data);
  }

  const response = await fetch(URL + resource, requestOptions);

  if (response.status === 401) {
    const errorText = await response.text();

    if (errorText.includes("Invalid Authentication")) {
      functions.logger.error("401 - Invalid Authentication");
      return {
        text: "401 - Invalid Authentication",
        status: response.status,
        data: null,
      };
    } else if (errorText.includes("Incorrect API key provided")) {
      functions.logger.error("401 - Incorrect API key provided");
      return {
        text: "401 - Incorrect API key provided",
        status: response.status,
        data: null,
      };
    } else if (
      errorText.includes(
        "You must be a member of an organization to use the API",
      )
    ) {
      functions.logger.error(
        "401 - You must be a member of an organization to use the API",
      );
      return {
        text: "401 - You must be a member of an organization to use the API",
        status: response.status,
        data: null,
      };
    }
    return {
      text: "401 - Auth Issues",
      status: response.status,
      data: null,
    };
  } else if (response.status === 429) {
    const errorText = await response.text();

    if (errorText.includes("Rate limit reached for requests")) {
      functions.logger.error("429 - Rate limit reached for requests");
      return {
        text: "429 - Rate limit reached for requests",
        status: response.status,
        data: null,
      };
    } else if (
      errorText.includes(
        "You exceeded your current quota, please check your plan and billing details",
      )
    ) {
      functions.logger.error(
        "429 - You exceeded your current quota, please check your plan and billing details",
      );
      return {
        text: "429 - You exceeded your current quota, please check your plan and billing details",
        status: response.status,
        data: null,
      };
    }
    return {
      text: "429 - Billing || Rate Limit",
      status: response.status,
      data: null,
    };
  } else if (response.status === 500) {
    functions.logger.error(
      "500 - The server had an error while processing your request",
    );
    return {
      text: "500 - The server had an error while processing your request",
      status: response.status,
      data: null,
    };
  } else if (response.status === 503) {
    functions.logger.error(
      "503 - The engine is currently overloaded, please try again later",
    );
    return {
      text: "503 - The engine is currently overloaded, please try again later",
      status: response.status,
      data: null,
    };
  }

  const result = response.status > 300 ? null : await response.json();
  return {
    text: "",
    status: response.status,
    data: result,
  };
};
