import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";

export const buildOrderTrackingEmailPayload = (
  chat: ChatDocument | EmailDocument,
) => {
  if (!chat.order) return "";
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  const {order_number, tracking_url} = chat.order;

  return `
    <p>
    Hi ${first_name},
    </p>
    <br />
    <p>
    I hope this message finds you well. I wanted to provide you with an update regarding the status of your order (${order_number}).
    </p>
    <p>
    I'm pleased to inform you that your order has been shipped! You can track the progress of your delivery using the following tracking link: <a href="${tracking_url}">Track Your Order</a>.
    </p>
    <p>
    Our team is working diligently to ensure a smooth and timely delivery for you. We've marked your support request as "Resolved" for now, but please don't hesitate to reach out if you have any further questions or concerns.
    </p>
    <p>
    Thank you for your patience and understanding, and we're here to help if there's anything else you need.
    </p>
  `;
};
