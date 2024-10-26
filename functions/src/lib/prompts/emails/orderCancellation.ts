import {ChatDocument} from "../../types/chats";

export const buildOrderCancelEmailPayload = (chat: ChatDocument) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  const order_number = chat.order ? chat.order.order_number : "";

  return `
    Hi ${first_name}

    We are sorry to hear that you are having trouble with your order. We have cancelled your order ${order_number} and issued a refund. Please allow 3-5 business days for the refund to appear on your statement.

    If you have any other questions or concerns, please let us know.
  `;
};
