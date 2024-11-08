import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";

export const buildAddressChangeOrderEmailPayload = (
  chat: ChatDocument | EmailDocument,
  new_address: string,
) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  const order_number = chat.order ? chat.order.order_number : "";

  return `
    <p>
      Hi ${first_name},
    </p>
    <br />
    <p>
      We're reaching out to confirm that the shipping address for your order (Order #${order_number}) has been successfully updated. Here are the new shipping details: 
    </p>
    <p>
      ${new_address}
    </p>
    <p>
      If you have any further questions or need additional changes, please feel free to reach out. We're here to ensure that your order arrives at the right place and as smoothly as possible.
    </p>
    <p>
      Thank you for your continued trust in us!
    </p>
  `;
};
