import {ChatDocument} from "../../types/chats";

export const buildDiscountEmailPayload = (chat: ChatDocument, code: string) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  return `
    Hi ${first_name},

    Thank you for contacting us. We have applied a discount code for your next order. Please use the following code at checkout to receive your discount:

    ${code}

    If you have any other questions or concerns, please let us know.
  `;
};
