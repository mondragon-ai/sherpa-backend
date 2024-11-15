import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import * as functions from "firebase-functions";

export const orderInProgress = (chat: ChatDocument | EmailDocument) => {
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
    Thank you for your order! We wanted to update you on the status of your order (${order_number}).
    </p>
    <p>
    Currently, your order is marked as "In Progress" because it's being prepared and fulfilled by one of our trusted third-party partners. This process may take a bit longer, as it's handled outside of our usual fulfillment centers. Rest assured, they are working diligently to complete your order.
    </p>
    <p>
    We will keep you updated and send a tracking link as soon as your order is shipped.
    </p>
    <p>
    Thank you for your patience and understanding. If you have any questions or need further assistance, please don't hesitate to reach out.
    </p>
  `;
};
