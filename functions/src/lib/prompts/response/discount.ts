import {basePrompt, buildCustomerPrompt, buildOrderPrompt} from ".";
import {ChatDocument} from "../../types/chats";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildDiscountPayload = (
  merchant: MerchantDocument,
  chat: ChatDocument,
  classification: ClassificationTypes,
) => {
  const {configurations} = merchant;
  const faqs =
    merchant.configurations.discounts.faqs
      .map((f) => `- [${f.q}]: ${f.q}`)
      .join("\n") || "N/A";
  return `
    ${basePrompt(merchant, chat, classification)}

    ${buildCustomerPrompt(chat)}

    ${buildOrderPrompt(chat)}

    ## Store Discounts
    - ${configurations.discounts.overview}

    ## Discount FAQ
    ${faqs}

    ## Conditions
    - Do not "make up" discounts. Only respond with the discounts included here.
    - If the customer is asking for a discount that is not included here, tell them that the discount is not available.
    - Be aware of the validity of the discounts relative to today's date.
    - ONLY respond queries regarding discounts. If asked about something else, tell them to email the store contact email.
  `;
};
