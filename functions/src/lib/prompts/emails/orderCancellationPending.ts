import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {MerchantDocument} from "../../types/merchant";

export const buildOrderCancelPendingEmailPayload = (
  chat: ChatDocument | EmailDocument,
  merchant: MerchantDocument,
) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  const order_number = chat.order ? chat.order.order_number : "";
  const contact_email = merchant.configurations.contact_email || "";
  return `
    <p>
      Hi ${first_name},
    </p>
    <br />
    <p>
      We are sorry to hear that you are having trouble with your order. Your order ${order_number} is currently in progress, so our team is working to cancel it. However, one of our trusted partners already started processing.
    </p>
    <p>
      Please email us at ${contact_email} once you have received the order, and we'll guide you through the steps to send it back. Once we receive the returned item, we will process your refund promptly.
    </p>
    <p>
      If you have any further questions or need assistance, please don't hesitate to reach out. We're here to help!
    </p>
  `;
};
