/**
 * Convert a multiline string to a single line string.
 *
 * @param text - The multiline string to convert.
 * @returns A single line string with newline characters and extra spaces removed.
 */
export const convertToSingleLine = (text: string): string => {
  const t = text
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t.replace(/"/g, "'");
};

/**
 *
 * @param inputString
 * @returns
 */
export function extractEmailFromString(inputString: string) {
  const emailRegex = /[\w.-]+@[\w.-]+\.[\w.-]+/;

  const matches = inputString.match(emailRegex);

  if (matches && matches.length > 0) {
    return matches[0];
  } else {
    return "";
  }
}

/**
 *
 * @param name
 * @returns
 */
export function capitalizeWords(name: string) {
  const words = name.replace("_", " ").split(" ");

  let word = "";
  for (const w of words) {
    word += w.charAt(0).toLocaleUpperCase() + w.substring(1) + " ";
  }

  return word;
}

export const encodeEmailForFirestoreId = (email: string): string => {
  return encodeURIComponent(email.toLowerCase()).replace(".", "-");
};

export const decodeFromBase64 = (s: string) => {
  return Buffer.from(s || "", "base64").toString("utf-8");
};

export const cleanGPTResponse = (gptResponse: string): string => {
  return gptResponse
    .replace(/```json\n?/, "") // Remove the starting "```json" with an optional newline
    .replace(/```$/, "") // Remove the ending "```"
    .replace(/\n/g, ""); // Remove any remaining newlines
};
