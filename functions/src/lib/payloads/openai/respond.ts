import {ChatDocument} from "../../types/chats";
import {basePrompt} from "../../prompts/response";
import {MerchantDocument} from "../../types/merchant";
import {ClassificationTypes} from "../../types/shared";
import {buildRefundPayload} from "../../prompts/response/refund";
import {buildStatusUpdate} from "../../prompts/response/statusUpdate";
import {buildOrderCancelPayload} from "../../prompts/response/orderCancellation";
import {buildOrderModifyPayload} from "../../prompts/response/orderModifcation";
import {buildDiscountPayload} from "../../prompts/response/discount";
import {buildGeneralPayload} from "../../prompts/response/general";
import {buildAdressPayload} from "../../prompts/response/address";
import {buildGiveawayPayload} from "../../prompts/response/giveaway";
import {buildSubscriptiontPayload} from "../../prompts/response/subscription";
import {buildProductPayload} from "../../prompts/response/product";

export const buildResponsePayload = (
  merchant: MerchantDocument,
  chat: ChatDocument,
  classification: ClassificationTypes,
  message: string,
) => {
  let prompt = "";

  switch (classification) {
    case ClassificationTypes.OrderRefund: {
      console.log("REFUND");
      prompt = buildRefundPayload(merchant, chat, classification);
      break;
    }
    case ClassificationTypes.OrderCancellation: {
      console.log("CANCEL");
      prompt = buildOrderCancelPayload(merchant, chat, classification);
      break;
    }
    case ClassificationTypes.OrderModification: {
      console.log("MOD");
      prompt = buildOrderModifyPayload(merchant, chat, classification);
      break;
    }
    case ClassificationTypes.OrderStatus: {
      console.log("ORDER_STATUS");
      prompt = buildStatusUpdate(merchant, chat, classification);
      break;
    }
    case ClassificationTypes.Discount: {
      console.log("DISCOUNTS");
      prompt = buildDiscountPayload(merchant, chat, classification);
      break;
    }
    case ClassificationTypes.General: {
      console.log("GENERAL");
      prompt = buildGeneralPayload(merchant, chat, classification);
      break;
    }
    case ClassificationTypes.OrderAddress: {
      console.log("ADDRESS");
      prompt = buildAdressPayload(merchant, chat, classification);
      break;
    }
    case ClassificationTypes.Giveaway: {
      console.log("GIVEAWAY");
      prompt = buildGiveawayPayload(merchant, chat, classification);
      break;
    }
    case ClassificationTypes.Subscription: {
      console.log("SUBS");
      prompt = buildSubscriptiontPayload(merchant, chat, classification);
      break;
    }
    case ClassificationTypes.Product: {
      console.log("PRODUCT");
      prompt = buildProductPayload(merchant, chat, classification);
      break;
    }
    default: {
      console.log("BASE");
      prompt = basePrompt(merchant, chat, classification);
      break;
    }
  }

  const payload = openaiResponsePayload(prompt, message, chat);
  return payload;
};

type BlockType = {
  role: "user" | "system" | "assistant";
  content: string;
};

const openaiResponsePayload = (
  prompt: string,
  message: string,
  chat: ChatDocument,
) => {
  const blocks = [
    {
      role: "system",
      content: prompt,
    },
  ] as BlockType[];

  for (const msg of chat.conversation || []) {
    if (msg.sender == "agent" && !msg.action && !msg.is_note) {
      blocks.push({
        role: "assistant",
        content: msg.message,
      });
    }
    if (msg.sender == "customer") {
      blocks.push({
        role: "user",
        content: msg.message,
      });
    }
  }

  if (message) {
    blocks.push({
      role: "user",
      content: message,
    });
  }
  return blocks;
};
