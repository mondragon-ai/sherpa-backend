import {ChatDocument} from "../../types/chats";
import {MerchantDocument} from "../../types/merchant";

export const buildOrderCancelUnavailableEmailPayload = (
  chat: ChatDocument,
  merchant: MerchantDocument,
) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  const order_number = chat.order ? chat.order.order_number : "";
  const contact_email = merchant.configurations.contact_email;

  return `
  
    Hi ${first_name},

    We are sorry to hear that you are having trouble with your order. We currently cannot cancel your order ${order_number} because it has already been shipped. Please contact us at your earliest convenience so we can resolve this issue.

    Contact email:  ${contact_email}

    If you have any other questions or concerns, please let us know.
  `;
};
