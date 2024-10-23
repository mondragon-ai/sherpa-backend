import * as crypto from "crypto";
const secret = process.env.ENCRYPTION_SECRET_KEY || "";
const algorithm = "aes-256-cbc";
const key = Buffer.from(secret, "hex");
const iv = Buffer.from("01ec86cf7ac60bcc0ef84f70be4ed6c5", "hex");

/**
 * Decrypts the given ciphertext using the AES-256-CBC algorithm.
 *
 * @param text The ciphertext to decrypt.
 * @returns The decrypted plaintext if decryption is successful, otherwise an empty string.
 */
export const decryptMsg = async (text: string) => {
  if (text !== "") {
    try {
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(text, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
      return "";
    }
  } else {
    return "";
  }
};

/**
 * Decrypts the given ciphertext using the AES-256-CBC algorithm.
 *
 * @param text The ciphertext to decrypt.
 * @returns The decrypted plaintext if decryption is successful, otherwise an empty string.
 */
export const decrypCard = async (text: string) => {
  if (text !== "") {
    try {
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(text, "base64", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
      return "";
    }
  } else {
    return "";
  }
};

/**
 * Encrypts the given plaintext using the AES-256-CBC algorithm.
 *
 * @param text The plaintext to encrypt.
 * @returns The encrypted ciphertext if encryption is successful, otherwise an empty string.
 */
export const encryptMsg = async (text: string) => {
  if (text !== "19uq99myrxd6jmp19k5mygo5d461l0" && text !== "") {
    try {
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(text, "utf8", "hex");
      encrypted += cipher.final("hex");
      return encrypted;
    } catch (error) {
      return "";
    }
  } else {
    return "";
  }
};

/**
 * Turn String to a buffer
 *
 * @param {string} input
 * @returns
 */
export function decodeBase64(input: string): string {
  return Buffer.from(input, "base64").toString("utf-8");
}

/**
 * Verifies the authenticity of a Shopify webhook by comparing the provided HMAC header
 * with the computed hash based on the webhook data and the client secret.
 *
 * @param {Buffer} data - The webhook data as a Buffer.
 * @param {string} hmacHeader - The HMAC header sent with the webhook.
 * @returns {boolean} - Returns true if the webhook is valid; otherwise, false.
 */
export function verifyShopifyWebhook(
  data: Buffer,
  hmacHeader: string,
): boolean {
  const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || "";

  // Convert the object to a JSON string
  const jsonData = JSON.stringify(data);

  // Convert the JSON string to a Buffer
  const bufferData = Buffer.from(jsonData, "utf-8");

  const hash = crypto
    .createHmac("sha256", CLIENT_SECRET)
    .update(bufferData)
    .digest("base64");

  // Ensure hmacHeader and hash are of the same length
  if (hmacHeader.length !== hash.length) {
    return false;
  }

  // Validate
  return crypto.timingSafeEqual(Buffer.from(hmacHeader), Buffer.from(hash));
}
