import {ChatDocument} from "../../types/chats";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";

export const buildResponsePayload = (
  merchant: MerchantDocument,
  chat: ChatDocument,
  message: string,
  classification: ClassificationTypes,
) => {
  switch (classification) {
    case ClassificationTypes.OrderRefund:
      return buildRefundPayload(merchant, chat);
    // case ClassificationTypes.OrderCancellation:
    //     return   respondToCustomerNew(chatData, message, "classified/order_cancellation");
    // case ClassificationTypes.OrderModification:
    //     return   respondToCustomerNew(chatData, message, "classified/order_modification");
    // case ClassificationTypes.OrderStatus:
    //     return   respondToCustomerNew(chatData, message, "classified/order_status");
    // case ClassificationTypes.Discount:
    //     return   respondToCustomerNew(chatData, message, "classified/discount");
    // case ClassificationTypes.General:
    //     return   respondToCustomerNew(chatData, message, "classified/general");
    // case ClassificationTypes.OrderAddress:
    //     return   respondToCustomerNew(chatData, message, "classified/order_address");
    // case ClassificationTypes.Giveaway:
    //     return   respondToCustomerNew(chatData, message, "classified/giveaway");
    // case ClassificationTypes.Subscription:
    //     return   respondToCustomerNew(chatData, message, "classified/subscription");
    // case ClassificationTypes.Product:
    //     return   respondToCustomerNew(chatData, message, "classified/product");
    default:
      return "";
  }
};

export const buildRefundPayload = (
  merchant: MerchantDocument,
  chat: ChatDocument,
) => {
  const {configurations} = merchant;
  const today = new Date().toDateString();
  return `
        As a customer service agent, respond to a customer's inquiry to return/refund their order. Here's the details about their order:

        ## Instructions
        - **DO NOT GENERATE FAKE/DUMMY INFO.**
        - Maintain a lighthearted and witty tone.
        - If asked, you are NOT a bot.
        - DO NOT REPEAT YOURSELF.
        - **Do not use email/letter format because you'll be in a chat with the customer. Also be concise.**
        - Supervisor approval may be required for certain actions.
        - ONLY respond with information included here. Do not "improvise" or "wing it", if the answer is not here, tell them to email the store contact email.
        - DO NOT insert data that is not included here, like "[Your Name Here]" or similar.

        ## Customer Summary
        ${chat.customer || "- not available"}

        ## Order Summary
        ${chat.order || " - not available"}

        **Store contact email:**  ${configurations.contact_email} 

        **TODAY'S DATE**:  ${today} 

        ## Conditions
        - Returns accepted within  ${configurations.return}  days.
        - ${configurations.refund} 
        - ONLY respond queries regarding refunds. If asked about something else, tell them to email the store contact email.
    `;
};
