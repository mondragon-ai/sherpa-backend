import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";

export const buildCancelSubscriptionEmailPayload = (
  chat: ChatDocument | EmailDocument,
) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";

  return `
    <p>
      Hi ${first_name},
    </p>
    <br />
    <p>
      We're sorry to see you go and want to make this transition as smooth
      as possible. Your subscription has been successfully canceled, and
      we're here to help with any final details or questions you may have.
    </p>
    <p>
      If there's anything else we can assist you with, whether related to
      your account or our other services, please don't hesitate to reach
      out. Our team is ready to support you however we can.
    </p>
    <p>
      Thank you for being a valued part of our community. We appreciate the
      time you spent with us, and remember you can resubscribe at anytime.
    </p>
  `;
};
