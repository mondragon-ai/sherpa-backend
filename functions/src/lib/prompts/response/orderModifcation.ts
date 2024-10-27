import {basePrompt, buildCustomerPrompt, buildOrderPrompt} from ".";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildOrderModifyPayload = (
  merchant: MerchantDocument,
  chat: ChatDocument | EmailDocument,
  classification: ClassificationTypes,
) => {
  return `
    ${basePrompt(merchant, chat, classification)}

    ${buildCustomerPrompt(chat)}

    ${buildOrderPrompt(chat)}

    ## Conditions
    - If the order is already shipped or no longer on hold, tell them that it's too late to modify the order -- send tracking URL if available.
    - ONLY respond queries regarding the modification of the specific order. If asked about something else, tell them to email the store contact email.
    - If the customer and/or data is not available ask for an order number or email associated with the order, then tell the customer that the supervisor will review and resolve the issue within 24-72 hours. 
  `;
};
