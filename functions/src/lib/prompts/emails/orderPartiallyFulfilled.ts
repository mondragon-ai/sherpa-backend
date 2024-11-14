import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import * as functions from "firebase-functions";

export const buildOrderPartiallyFulfilled = (
  chat: ChatDocument | EmailDocument,
) => {
  if (!chat.order) return "";
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  const {order_number, line_items} = chat.order;

  const digital = line_items?.filter((i) => !i.is_physical);
  functions.logger.info({digital});

  return `
    <p>
  Hi ${first_name},
    </p>
    <br />
    <p>
  Thank you for your order! We wanted to let you know that part of your order (#${order_number}) has been partially fulfilled and is on its way.
    </p>
    <p>
  The remaining items are currently being picked, packed, and prepared for shipment. We're working hard to get everything to you as quickly as possible. Please allow for normal processing and shipping times for these items.
    </p>
    <p>
  You'll receive a confirmation email with tracking details as soon as the remaining items are shipped.
    </p>
    <p>
  Thank you for your patience and understanding, and please feel free to reach out if you have any questions or need further assistance.
    </p>
  `;
};
