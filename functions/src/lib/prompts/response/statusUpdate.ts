import {basePrompt, buildCustomerPrompt, buildOrderPrompt} from ".";
import {ChatDocument} from "../../types/chats";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildStatusUpdate = (
  merchant: MerchantDocument,
  chat: ChatDocument,
  classification: ClassificationTypes,
) => {
  const {configurations} = merchant;
  return `
    ${basePrompt(merchant, chat, classification)}

    ${buildCustomerPrompt(chat)}

    ${buildOrderPrompt(chat)}

    ## Conditions
    - Unfulfilled orders due to high demand.
    - ${configurations.shipping}
    - ONLY provide the tracking number/link IF it is available in the order summary.
    - ONLY respond queries regarding the current order. If asked about something else, tell them to email the store contact email.
    - We do not expedite orders
    - If the customer and/or data is not available ask for an order number or email associated with the order, then tell the customer that the supervisor will review and resolve the issue within 24-72 hours. 
  `;
};
