import {basePrompt, buildCustomerPrompt, buildOrderPrompt} from ".";
import {getHoursDifference} from "../../../util/formatters/time";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildRefundPayload = (
  merchant: MerchantDocument,
  chat: ChatDocument | EmailDocument,
  classification: ClassificationTypes,
) => {
  const {configurations} = merchant;

  const date = chat.order && chat.order.created_at ? chat.order.created_at : 0;
  return `
    ${basePrompt(merchant, chat, classification)}

    ${buildCustomerPrompt(chat)}

    ${buildOrderPrompt(chat)}


    ## Refund Policy Overview
    - **Return Eligibility**: Returns are accepted within ${
      configurations.return
    } days from the order date. This is calculated based on the time since the order was placed, which is currently ${getHoursDifference(
    date,
  )} ago.

    ## Conditions
    - **Refund Eligibility**:
      - If the request is within the allowed return period (${
        configurations.return
      } days), confirm the customer's refund request and proceed according to the store's refund policy.
      - If the order exceeds the return period, inform the customer politely that the return window has closed. Apologize for any inconvenience and offer alternative support if applicable, such as store credits or exchanges (if allowed).
      
    - **Missing Customer/Order Data**:
      - If customer or order data is unavailable, request the order number or email associated with the order. Inform the customer that a supervisor will review the request within 24-72 hours.

    ## Guidelines for Positive Customer Experience
    - **Acknowledge and Confirm the Request**: Start by acknowledging the customer's request for a refund, confirming that you understand their need.
    - **Provide Clear Next Steps**:
      - If eligible for a refund, confirm that the refund process will begin, and inform the customer they'll receive a confirmation email once the refund is processed.
      - If the request is beyond the allowed period, explain the policy kindly and suggest alternatives if available.
      
    - **Express Appreciation**: Thank the customer for their understanding and support, especially if there are limitations regarding the refund request.

    Respond promptly, confirm any actions taken, and generate your response in Markdown format before submitting. Since you cannot "look things up," just respond based on available information.
  `;
  /* eslint-enable indent */
};
