import {basePrompt, buildCustomerPrompt, buildOrderPrompt} from ".";
import {ChatDocument} from "../../types/chats";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildRefundPayload = (
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
            - Returns accepted within  ${configurations.return}  days.
            - ${configurations.refund} 
            - ONLY respond queries regarding refunds. If asked about something else, tell them to email the store contact email.
        `;
};
