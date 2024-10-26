import {ChatDocument} from "../../types/chats";

export const buildOrderTrackingEmailPayload = (
  chat: ChatDocument,
  tracking: string,
) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";

  return `
    Hi ${first_name}},

    I hope this message finds you well. I wanted to provide you with an update regarding the status of your order.

    I'm pleased to inform you that your order has now entered the shipping process. To track the progress of your delivery, you can use the following tracking URL: [tracking](${tracking}).

    Rest assured, our team is diligently working to ensure a smooth and expedited delivery for you. We have also marked your support request as "Resolved" for the time being. However, please don't hesitate to reach out to us if you have any further questions or concerns.

    Your patience and understanding are greatly appreciated throughout this process.

    If there's anything else we can assist you with, please don't hesitate to let us know.
  `;
};
