import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {MerchantDocument} from "../../types/merchant";

export const buildOrderCancelPendingEmailPayload = (
  chat: ChatDocument | EmailDocument,
  merchant: MerchantDocument,
) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  const order_number = chat.order ? chat.order.order_number : "";

  return `
    Hi ${first_name},

    We are sorry to hear that you are having trouble with your order. Your order ${order_number} is currently pending, so our team is working to cancel it. We will reach out to you as soon as possible to confirm the cancellation.

    Contact email: ${merchant.configurations.contact_email}

    If you have any other questions or concerns, please let us know.
  `;
};
