import {Status} from "../lib/types/shared";
import * as functions from "firebase-functions";

/**
 * Creates a standardized response object for errors.
 *
 * @param {Status} status - The HTTP status code.
 * @param {string} message - The error message.
 * @param {string} data - null | any
 * @returns {{ status: Status; ok: boolean; text: string; product: null; error: true }} - The error response object.
 */
export const createResponse = (
  status: Status,
  message: string,
  data: any,
): {status: Status; message: string; data: null} => {
  functions.logger.error(message);
  return {
    status: status,
    message: message,
    data: data,
  };
};
