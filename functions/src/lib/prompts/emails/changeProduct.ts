import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";

export const buildChangeProductEmailPayload = (
  chat: ChatDocument | EmailDocument,
) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  const order_number = chat.order ? chat.order.order_number : "";

  return `
    <p>
      Hi ${first_name},
    </p>
    <br />
    <p>
      We're happy to let you know that the product change for your order (Order #${order_number}) has been successfully processed. Your updated order is now set, and we're working to get it to you as quickly as possible.
    </p>
    <p>
      If you have any more questions or need additional assistance, please don't hesitate to reach out. We're here to help!
    </p>
    <p>
      Thank you for choosing us, and we look forward to delivering your updated order soon.
    </p>
  `;
};
