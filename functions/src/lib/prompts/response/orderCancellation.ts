import {basePrompt, buildCustomerPrompt, buildOrderPrompt} from ".";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildOrderCancelPayload = (
  merchant: MerchantDocument,
  chat: ChatDocument | EmailDocument,
  classification: ClassificationTypes,
) => {
  const {configurations} = merchant;
  const discount = configurations.price_rules.id
    ? "- Offer a discount for the next order: 10% for orders less than $25.00, up to 25% off for orders greater than $50.00 before refunding or canceling an order."
    : "";

  /* eslint-disable indent */
  return `
    ${basePrompt(merchant, chat, classification)}

    ${buildCustomerPrompt(chat)}

    ${buildOrderPrompt(chat)}

    ## Conditions
    - IF the order is not found, be sure to not make up information about the order.
    - ONLY use the ** STORE contact email ** when telling them to email the store contact email.
    - If the order is already shipped, tell them that it's too late to cancel the order.
    - ONLY cancel or say you will cancel when an order object is available.
    - ONLY respond inquiries asking to cancel specific order. If asked about something else, tell them to email the store contact email.
    - If the customer and/or order data is not available ask for an order number or email associated with the order, then tell the customer that the supervisor will review and resolve the issue within 24-72 hours. 
    ${chat.order ? discount : ""}
  `;
  /* eslint-enable indent */
};
