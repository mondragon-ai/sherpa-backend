import {basePrompt, buildCustomerPrompt, buildOrderPrompt} from ".";
import {ChatDocument} from "../../types/chats";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildOrderCancelPayload = (
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
    - If the order is already shipped, tell them that it's too late to cancel the order.
    - ONLY respond inquiries asking to cancel specific order. If asked about something else, tell them to email the store contact email.
    - If the customer and/or data is not available ask for an order number or email associated with the order, then tell the customer that the supervisor will review and resolve the issue within 24-72 hours. 
    ${
      configurations.price_rules.id
        ? "- Offer a discount for the next order: 10% for orders less than $25.00, up to 25% off for orders greater than $50.00 before refunding or canceling an order."
        : ""
    }
  `;
};
