import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";

export const buildAddressChangeCustomerEmailPayload = (
  chat: ChatDocument | EmailDocument,
  new_address: string,
) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  const order_number = chat.order ? chat.order.order_number : "";

  return `
    <p
      style="
        font-family: sans-serif;
        font-size: 13px;
        line-height: 20px;
        font-weight: 400;
      "
    >
      Hi ${first_name},
    </p>
    <br />

    <p
      style="
        font-family: sans-serif;
        font-size: 13px;
        line-height: 20px;
        font-weight: 400;
      "
    >
      Thank you for contacting us. We have updated your shipping address to ${new_address} for your order. 
    </p>

    <p
      style="
        font-family: sans-serif;
        font-size: 13px;
        line-height: 20px;
        font-weight: 400;
      "
    >
      Since your order ${order_number} has already been shipped, we have not updated the shipping address for this order.
    </p>
  `;
};
