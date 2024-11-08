import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";

export const buildOrderStatusEmailPayload = (
  chat: ChatDocument | EmailDocument,
) => {
  if (!chat.order) return "";
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  const {order_number, fulfillment_status} = chat.order;

  return `
  <p>
    Hi ${first_name},
  </p>
  <br />
  <p>
    Thank you for reaching out regarding the status of your order (#${order_number}). We wanted to inform you that your order is currently marked as "${fulfillment_status}". We appreciate your patience.
  </p>
  <p>
    Please rest assured that our team is actively working to expedite the processing of your order. We have marked your support request as "Resolved" for now, but please don't hesitate to contact us if you have any further questions or concerns.
  </p>
  <p>
    We truly appreciate your understanding, and we're here to help with anything you need.
  </p>
  `;
};
