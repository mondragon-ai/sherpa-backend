import {ChatDocument} from "../../types/chats";
import {MerchantDocument} from "../../types/merchant";

export const buildAddressChangeOrderEmailPayload = (
  chat: ChatDocument,
  merchant: MerchantDocument,
  new_address: string,
) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  const order_number = chat.order ? chat.order.order_number : "";

  return `

    Hi ${first_name},

    Thank you for contacting us. We have updated your shipping address to ${new_address} for your order ${order_number}, as well as in your customer profile.
    
    If you have any other questions or concerns, please let us know.
  `;
};
