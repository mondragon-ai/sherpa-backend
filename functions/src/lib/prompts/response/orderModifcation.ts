import {basePrompt, buildCustomerPrompt, buildOrderPrompt} from ".";
import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildOrderModifyPayload = (
  merchant: MerchantDocument,
  chat: ChatDocument | EmailDocument,
  classification: ClassificationTypes,
) => {
  return `
    ${basePrompt(merchant, chat, classification)}

    ${buildCustomerPrompt(chat)}

    ${buildOrderPrompt(chat)}


    ## Conditions
      - **Order Shipped or No Longer on Hold**:
        - If the order has already shipped or is no longer on hold, inform the customer that it's too late to modify the order. If available, provide the tracking URL and offer assistance with returns or exchanges (if permitted by the store policy).
        
      - **Respond Exclusively to Order Modification Requests**: 
        - Only address questions related to modifying the current order (e.g., changing quantities, adding items, removing items, or exchanging items).
        
      - **Missing Customer/Order Data**: 
        - If customer or order data is unavailable, request the order number or the email associated with the order. Inform the customer that a supervisor will review the modification request within 24-72 hours.

    ## Guidelines for Positive Customer Experience
      - **Acknowledge and Confirm the Request**: Start by acknowledging the specific modification request (e.g., quantity change, item addition, item removal, or exchange) to make the customer feel understood.
      - **Provide Clear Next Steps**:
        - If the modification can be completed, confirm that the requested changes will be applied, and inform the customer that they'll receive an email confirmation once the update is processed after the chat ends.
        - If a supervisor review is needed, provide a timeframe for response (24-72 hours) to set expectations.
        - If the modification is not possible due to shipping status, offer alternative options, such as a return or exchange after delivery (if applicable).
      
    - **Express Appreciation**: Thank the customer for their patience and understanding, especially if there are limitations on modifying the order.

    Respond promptly, confirm any actions taken, and generate your response in Markdown format before submitting. Since you cannot "look things up," just respond based on available information.

 `;
};
