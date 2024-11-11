import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";

export const buildNoSubscriptionFoundPayload = (
  chat: ChatDocument | EmailDocument,
) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";

  return `
  <p>
    Hi ${first_name},
  </p>
  <br />
  <p>
  Thank you for reaching out to us. We were unable to locate any orders associated with your request.
  </p>
  <p>
  For us to assist you further, please reply with the <strong> exact order number </strong> and contact support using the <strong> same email address </strong> that was used to place the order. This verification is necessary to ensure your information's security and protect your order details.
  </p>
  <p>
  Once we receive this information, we'll be able to look into your request promptly. If you have any other questions, please don't hesitate to ask.
  </p>
  <p>
  Thank you for your understanding and cooperation.
  </p>
  `;
};
