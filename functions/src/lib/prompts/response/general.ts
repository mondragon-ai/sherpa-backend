import {basePrompt, buildCustomerPrompt, buildOrderPrompt} from ".";
import {ChatDocument} from "../../types/chats";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildGeneralPayload = (
  merchant: MerchantDocument,
  chat: ChatDocument,
  classification: ClassificationTypes,
) => {
  return `
    ${basePrompt(merchant, chat, classification)}

    ${buildCustomerPrompt(chat)}

    ${buildOrderPrompt(chat)}

    ## Conditions
    - ONLY respond queries regarding the store or its products. If asked about something else, tell them to email the store contact email.
    - Tech issues and other issues will be noted and relayed to relevant teams. thank them.
  `;
};
