import fetch from "node-fetch";
import * as functions from "firebase-functions";

const base = "https://api.rechargeapps.com";

export const rechargeAPIRequests = async (
  resource: string,
  method: string,
  data: any,
  recharge_at: string,
) => {
  const HEADERS = {
    ["Content-Type"]: "application/json",
    ["X-Recharge-Access-Token"]: "" + recharge_at,
  };

  let options = {
    method: method || "GET",
    headers: HEADERS,
  } as any;

  if (data !== null) {
    options = {
      method: method || "GET",
      headers: HEADERS,
      body: JSON.stringify(data),
    };
  }

  const url = `${base}${resource}`;

  console.log({options, url});
  try {
    const response = await fetch(url, options);

    console.log({recharge: response.status});

    if (response.status === 200) {
      const result = await response.json();
      return {
        text: ` - Success. ${resource}`,
        status: response.status,
        data: result,
      };
    } else if (response.status === 201) {
      const result = await response.json();
      return {
        text: ` - Recharge Customer Added to List. ${resource}`,
        status: response.status,
        data: result,
      };
    } else if (response.status === 204) {
      return {
        text: ` - Recharge Customer Added to List. ${resource}`,
        status: response.status,
        data: null,
      };
    } else if (response.status === 400) {
      const text =
        "[RECHARGE] 400 - Bad Request: Request is missing or has a bad parameter";
      functions.logger.error(text);

      return {
        text: text,
        status: 400,
        data: null,
      };
    } else if (response.status === 401) {
      const text =
        "[RECHARGE] 401 - Not Authorized: Key is valid, but account does not have permissions to perform this action";
      functions.logger.error(text);

      return {
        text: text,
        status: 400,
        data: null,
      };
    } else if (response.status === 403) {
      const text =
        "[RECHARGE] 403 - Forbidden: Request is missing or has an invalid API key";
      functions.logger.error(text);

      return {
        text: text,
        status: 400,
        data: null,
      };
    } else if (response.status === 404) {
      const text =
        "[RECHARGE] 404 - Not Found: The requested resource doesn't exist";
      functions.logger.error(text);

      return {
        text: text,
        status: 400,
        data: null,
      };
    } else if (response.status === 409) {
      const text = "[RECHARGE] 409 - Conflict: User Exists.";

      const result = await response.json();
      return {
        text: text,
        status: 409,
        data: result,
      };
    } else if (response.status === 429) {
      const text =
        "[RECHARGE] 429 - Rate Limit: You hit the rate limit for this endpoint";
      functions.logger.error(text);

      return {
        text: text,
        status: 400,
        data: null,
      };
    } else if (response.status === 500) {
      const text =
        "[RECHARGE] 500 - Server Error: Something is wrong on Recharge's end";
      functions.logger.error(text);

      return {
        text: text,
        status: 400,
        data: null,
      };
    } else {
      const text = `[RECHARGE] - Unknown Error: Status Code ${response.status}`;
      functions.logger.error(text);
      functions.logger.error(response);

      return {
        text: text,
        status: 400,
        data: null,
      };
    }
  } catch (error) {
    return {
      text: ` - Recharge API Error: ${error}`,
      status: 500,
      data: null,
    };
  }
};
