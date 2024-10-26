import {ChatDocument} from "../../types/chats";

export const buildOrderStatusEmailPayload = (chat: ChatDocument) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";

  return `
    Hi ${first_name},

    Upon reviewing the status of your order, we regret to inform you that it is currently on "HOLD" due to an unexpected surge in demand. Please accept our sincere apologies for any inconvenience this may have caused.

    Rest assured, our team is actively working on resolving this issue and expediting the processing of your order. We have marked your support request as "Resolved" for now, but please feel free to reach out to us if you have any further questions or concerns.

    We appreciate your patience and understanding in this matter.

    If you have any other questions or concerns, please let us know.
  `;
};
