import {basePrompt, buildCustomerPrompt, buildOrderPrompt} from ".";
import {ChatDocument} from "../../types/chats";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildAdressPayload = (
  merchant: MerchantDocument,
  chat: ChatDocument,
  classification: ClassificationTypes,
) => {
  return `
    ${basePrompt(merchant, chat, classification)}

    ${buildCustomerPrompt(chat)}

    ${buildOrderPrompt(chat)}

    ## Conditions
    - If the order is already shipped ( fullfilment status is anything other than HOLD), tell them that it's too late to change the address.
    - ONLY respond inquiries asking to change the address of this order. If asked about something else, tell them to email the store contact email.
    - If an address needs to change please request the customer to send a new address in this format to change: street, city, state, country zip.
  `;
};
