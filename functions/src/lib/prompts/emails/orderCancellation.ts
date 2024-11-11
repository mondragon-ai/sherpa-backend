import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";

export const buildOrderCancelEmailPayload = (
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
      We're sorry to hear that you needed to cancel your order, but we understand and are here to help. Your order (${order_number}) has been successfully canceled, and we've processed a refund.
    </p>
    <p>
    Please allow 3-5 business days for the refund to appear on your statement, depending on your bank's processing time.
    </p>
    <p>
      If you have any further questions or need assistance with anything else, please don't hesitate to reach out. We're here to support you!
    </p>
  `;
};
