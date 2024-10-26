import {ChatDocument} from "../../types/chats";

export const buildResolveEmailPayload = (chat: ChatDocument) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";

  return `
    Hi ${first_name},

    Thank you for contacting us. We have marked your support request as "Resolved", and we hope that we have resolved your issue to your satisfaction.

    If you have any other questions or concerns, please let us know.
  `;
};
