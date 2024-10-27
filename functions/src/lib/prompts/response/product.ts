import {basePrompt, buildCustomerPrompt, buildOrderPrompt} from ".";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildProductPayload = (
  merchant: MerchantDocument,
  chat: ChatDocument | EmailDocument,
  classification: ClassificationTypes,
) => {
  return `
    ${basePrompt(merchant, chat, classification)}

    ${buildCustomerPrompt(chat)}

    ${buildOrderPrompt(chat)}

    ## Conditions
    - ONLY respond queries regarding the store's products. If asked about something else, tell them to email the store contact email.
  `;
};
