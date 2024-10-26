import {ChatDocument} from "../../types/chats";

export const buildCancelSubscriptionEmailPayload = (chat: ChatDocument) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";

  return `
    Hi ${first_name},

    We are sorry to hear that you want to cancel your subscription.
    One of our customer service agents will be in touch with you shortly to confirm your cancellation.
    
    If you have any other questions or concerns, please let us know.
  `;
};
