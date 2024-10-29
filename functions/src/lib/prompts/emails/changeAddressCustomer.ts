import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {MerchantDocument} from "../../types/merchant";

export const buildAddressChangeCustomerEmailPayload = (
  chat: ChatDocument | EmailDocument,
  merchant: MerchantDocument,
  new_address: string,
) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  const order_number = chat.order ? chat.order.order_number : "";
  const contact_email = merchant.configurations.contact_email;

  return `

    Hi ${first_name},

    Thank you for contacting us. We have updated your shipping address to ${new_address} in your customer profile.
    
    Since your order ${order_number} has already been shipped, we have not updated the shipping address for this order.
    
    If you would like to update the shipping address for this order, please contact us at ${contact_email} and we will do our best to help you.
  `;
};
