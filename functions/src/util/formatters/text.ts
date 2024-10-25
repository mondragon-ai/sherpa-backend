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

export function extractEmailFromString(inputString: string) {
  const emailRegex = /[\w.-]+@[\w.-]+\.[\w.-]+/;

  const matches = inputString.match(emailRegex);

  if (matches && matches.length > 0) {
    return matches[0];
  } else {
    return null;
  }
}

export function capitalizeWords(name: string) {
  const words = name.replace("_", " ").split(" ");

  let word = "";
  for (const w of words) {
    word += w.charAt(0).toLocaleUpperCase() + w.substring(1) + " ";
  }

  return word;
}

// const messageToPromptString = (message: EmailMessage): string => {
//   return `**Subject:**\n${message.subject}\n\n**Email Body:**\n${message.message}`;
// };

// export const extractOrderNumberFromEmail = async (email: EmailMessage): Promise<string | null> => {
//     const input = messageToPromptString(email);
//     return await extractWithGPT<string>(input, "extraction/order_number");
// };
