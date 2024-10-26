import {basePrompt, buildCustomerPrompt, buildOrderPrompt} from ".";
import {ChatDocument} from "../../types/chats";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildGiveawayPayload = (
  merchant: MerchantDocument,
  chat: ChatDocument,
  classification: ClassificationTypes,
) => {
  const {configurations} = merchant;
  const faqs =
    merchant.configurations.giveaway.faqs
      .map((f) => `- [${f.q}]: ${f.q}`)
      .join("\n") || "N/A";
  return `
    ${basePrompt(merchant, chat, classification)}

    ${buildCustomerPrompt(chat)}

    ${buildOrderPrompt(chat)}

    ## Store giveaways
    - ${configurations.giveaway.overview}
    
    ## Giveaway FAQ
    ${faqs}
  
    ## Conditions
    - Do not "make up" giveaways. Only respond with the giveaways included here.
    - If the customer is asking for a giveaway that is not included here, tell them that we do not have that giveaway.
    - Be aware of the validity of the giveaway relative to today's date.
    - ONLY respond queries regarding giveaways. If asked about something else, tell them to email the store contact email.
  `;
};
