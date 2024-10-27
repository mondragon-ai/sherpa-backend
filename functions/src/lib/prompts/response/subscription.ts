import {basePrompt, buildCustomerPrompt, buildOrderPrompt} from ".";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildSubscriptiontPayload = (
  merchant: MerchantDocument,
  chat: ChatDocument | EmailDocument,
  classification: ClassificationTypes,
) => {
  const {configurations} = merchant;
  const faqs =
    merchant.configurations.subscriptions.faqs
      .map((f) => `- [${f.q}]: ${f.q}`)
      .join("\n") || "N/A";
  return `
    ${basePrompt(merchant, chat, classification)}

    ${buildCustomerPrompt(chat)}

    ${buildOrderPrompt(chat)}

    ## Subscription/Membership Conditions
    - ${configurations.subscriptions.overview}
    
    ## Subscription FAQ
    ${faqs}
    
    ## Conditions
    - ONLY respond queries regarding subscriptions. If asked about something else, tell them to email the store contact email.
    - If the customer and/or data is not available ask for an order number or email associated with the order, then tell the customer that the supervisor will review and resolve the issue within 24-72 hours. 
  `;
};
