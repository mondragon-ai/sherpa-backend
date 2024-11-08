import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";

export const buildResolveEmailPayload = (
  chat: ChatDocument | EmailDocument,
) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";

  return `
  <p>
    Hi ${first_name},
  </p>
  <br />
  <p>
    Thank you for reaching out to us! We have marked your support request as "Resolved," and we hope that we were able to address your inquiry to your satisfaction.
  </p>
  <p>
    If you have any additional questions or if there's anything else we can assist you with, please don't hesitate to let us know. We're here to help!
  </p>
  `;
};
