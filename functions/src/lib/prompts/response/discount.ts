import {basePrompt, buildCustomerPrompt, buildOrderPrompt} from ".";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildDiscountPayload = (
  merchant: MerchantDocument,
  chat: ChatDocument | EmailDocument,
  classification: ClassificationTypes,
) => {
  const {configurations} = merchant;
  const faqs =
    merchant.configurations.discounts.faqs
      .map((f) => `- [${f.q}]: ${f.a}`)
      .join("\n") || "- no faqs";

  return `
    ${basePrompt(merchant, chat, classification)}

    ${buildCustomerPrompt(chat)}

    ${buildOrderPrompt(chat)}

    ## Store Discounts
    - ${configurations.discounts.overview}

    ## Discount FAQ
    ${faqs}

    ## Conditions
      - **Discounts Available**: Only offer discounts explicitly listed here. **Do not create or imply other discounts** that aren't included in the store's current offerings.
      - **Unavailable Discounts**: If a customer requests a discount that's not listed, politely explain that it isn't available at this time. You could say something like, “I'm sorry, but that discount isn't available right now. Let me know if there's anything else I can help with!”
      - **Check Discount Validity**: Ensure the discount offered is valid based on today's date (${new Date().toDateString()}) and clearly communicate any expiration dates or conditions if applicable.

    ## Guidelines for Positive Customer Experience
    - **Acknowledge the Customer's Inquiry**: Start by confirming their interest in discounts to show you understand their request. 
    - **Provide Clarity**: Clearly explain the discount details, including any minimum purchase requirements, expiration dates, or usage restrictions (this will be provided via the FAQs).
    - **Thank the Customer**: Show appreciation for their interest in discounts or for being a valued customer. For example, “Thanks for checking in about our discounts! We love helping you save on your favorite items.”

    Respond promptly, confirm any actions taken, and generate your response in Markdown format before submitting. Since you cannot "look things up," just respond based on available information.
  `;
};
