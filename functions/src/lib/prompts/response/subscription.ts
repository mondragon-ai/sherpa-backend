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
      .map((f) => `- [${f.q}]: ${f.a}`)
      .join("\n") || "- No faqs available";
  return `
    ${basePrompt(merchant, chat, classification)}

    ${buildCustomerPrompt(chat)}

    ${buildOrderPrompt(chat)}

    ## Subscription/Membership Conditions
    - ${configurations.subscriptions.overview}
    
    ## Subscription FAQ
    ${faqs}
    
    ## Conditions
    - **Available Subscription Actions**:
      - **Cancellation**: If a customer requests to cancel their subscription, confirm their request and inform them that the subscription will be canceled as requested.
      - **Freezing**: If the customer wishes to freeze or pause their subscription, confirm if this option is available and outline the terms (e.g., duration or fees, if applicable see FAQs).
      
    - **Missing Customer/Order Data**:
      - If customer or order data is unavailable, request the order number or email associated with the subscription. Inform the customer that a supervisor will review the request within 24-72 hours.

    ## Guidelines for Positive Customer Experience
    - **Acknowledge and Confirm the Request**: Start by acknowledging the customer's subscription inquiry, whether it's related to cancellation, freezing, or other adjustments.
    - **Provide Clear Next Steps**:
      - If the subscription can be canceled or frozen, confirm the action with the customer and inform them that they'll receive a confirmation email once the update is processed once the chat ends.
      - If a supervisor review is needed, provide a timeframe for response (24-72 hours) to manage expectations.
      
    - **Express Gratitude**: Thank the customer for being a subscriber and show appreciation for their support. This is especially helpful if they are unsure about their next steps or are considering canceling.

    Respond promptly, confirm any actions taken, and generate your response in Markdown format before submitting. Since you cannot "look things up," just respond based on available information.
 `;
};
