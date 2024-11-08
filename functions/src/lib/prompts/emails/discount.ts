import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";

export const buildDiscountEmailPayload = (
  chat: ChatDocument | EmailDocument,
  code: string,
) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";
  return `
    <p>
      Hi ${first_name},
    </p>
    <br />
    <p>
      Thank you for giving us the opportunity to make things right! We're happy to offer you a discount on your next order. Please use the following code at checkout to enjoy your discount:
    </p>
    <p>
    <strong>${code} </strong>
    </p>
    <p>
      We hope this enhances your experience with us, and we're here to help with any other questions or concerns you may have. 
    </p>
    <p>
      Thank you for being a valued part of our community, and we look forward to serving you again soon!
    </p>
  `;
};
