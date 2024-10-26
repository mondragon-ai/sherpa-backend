import {ChatDocument} from "../../types/chats";

export const buildChangeProductEmailPayload = (chat: ChatDocument) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  const order_number = chat.order ? chat.order.order_number : "";

  return `
    Hi ${first_name},

    Thank you for contacting us. One of our team members will be in touch with you shortly regarding your order ${order_number} and your request to change your product(s).

    If you have any other questions or concerns, please let us know.
  `;
};
