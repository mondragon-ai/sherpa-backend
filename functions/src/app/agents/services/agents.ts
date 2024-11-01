import {
  buildResolvedChatPayload,
  createChatPayload,
  respondToChatPayload,
} from "../../../lib/payloads/chats";
import {
  fetchRootDocument,
  fetchSubcollectionDocument,
  updateSubcollectionDocument,
} from "../../../database/firestore";
import {
  fetchCustomerOrderList,
  fetchShopifyOrder,
} from "../../../networking/shopify/orders";
import {
  generateSuggestedEmail,
  sendEmail,
} from "../../../lib/helpers/emails/emails";
import {
  fetchChatMessages,
  generateChatMessages,
} from "../../../lib/payloads/openai/conversation";
import * as functions from "firebase-functions";
import {decryptMsg} from "../../../util/encryption";
import {createResponse} from "../../../util/errors";
import {EmailDocument} from "../../../lib/types/emails";
import {SuggestedActions} from "../../../lib/types/shared";
import {MerchantDocument} from "../../../lib/types/merchant";
import {respondToChatGPT} from "../../../networking/openAi/respond";
import {classifyMessage} from "../../../lib/helpers/agents/classify";
import {generateSummary} from "../../../networking/openAi/summarize";
import {performActions} from "../../../lib/helpers/automation/actions";
import {CleanedCustomerOrder} from "../../../lib/types/shopify/orders";
import {updateMerchantUsage} from "../../../networking/shopify/billing";
import {ChatDocument, ChatStartRequest} from "../../../lib/types/chats";
import {generateSentimentGPT} from "../../../networking/openAi/sentiment";
import {fetchShopifyProducts} from "../../../networking/shopify/products";
import {buildResponsePayload} from "../../../lib/payloads/openai/respond";
import {fetchShopifyCustomer} from "../../../networking/shopify/customers";
import {generateSuggestedAction} from "../../../lib/helpers/agents/resolve";
import {cleanCustomerPayload} from "../../../lib/payloads/shopify/customers";
import {getCurrentUnixTimeStampFromTimezone} from "../../../util/formatters/time";

export const searchCustomer = async (domain: string, email: string) => {
  if (!domain || !email) return createResponse(400, "Missing params", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "No merchant found", null);

  const shpat = await decryptMsg(merchant.access_token);
  const customer = await fetchShopifyCustomer(domain, shpat, email);
  if (!customer) return createResponse(422, "No customer found", null);

  return createResponse(200, "Customer Found", {customer});
};

export const fetchCustomerOrders = async (domain: string, email: string) => {
  if (!domain || !email) return createResponse(400, "Missing params", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "No merchant found", null);

  const shpat = await decryptMsg(merchant.access_token);
  const customer = await fetchShopifyCustomer(domain, shpat, email);
  if (!customer) return createResponse(422, "No customer found", null);

  const customer_id = customer.id;
  const orders = await fetchCustomerOrderList(domain, shpat, customer_id);
  if (!orders) return createResponse(422, "No orders found", null);

  return createResponse(200, "Orders Found", {orders});
};

export const searchProduct = async (domain: string, query: string) => {
  if (!domain || !query) return createResponse(400, "Missing params", null);

  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "No merchant found", null);

  const shpat = await decryptMsg(merchant.access_token);
  const products = await fetchShopifyProducts(domain, shpat, query);
  if (!products) return createResponse(422, "No products found", null);

  return createResponse(200, "Products Found", {products});
};

export const startChat = async (
  domain: string,
  email: string,
  payload: ChatStartRequest,
) => {
  if (!domain || !payload) return createResponse(400, "Missing params", null);
  const {issue} = payload;

  if (issue !== "general" && !email) {
    return createResponse(400, "Email required", null);
  }
  // Fetch Chat
  const {data: doc} = await fetchSubcollectionDocument(
    "shopify_merchant",
    domain,
    "chats",
    email,
  );
  const existing_chat = doc as ChatDocument;

  if (existing_chat && existing_chat.status == "open") {
    const convo = fetchChatMessages(existing_chat.conversation);
    return createResponse(201, "Still Open", convo);
  }

  // Fetch Merchant
  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "No merchant found", null);

  // Update Merchant Usage
  const response = await updateMerchantUsage(domain, merchant);
  if (response.capped || !response.charged) {
    return createResponse(429, "Could not charge merchant", null);
  }

  // Fetch customer & order
  const {customer, order} = await fetchCustomerData(merchant, payload);

  // Validate order & email
  if (customer?.email && order && order?.email !== "") {
    if (order?.email !== email) {
      return createResponse(409, "Email Must Match", {chat: null});
    }
  }

  // Create payload
  const {chat, message} = createChatPayload(
    merchant,
    existing_chat,
    customer,
    order,
    payload,
  );

  await updateSubcollectionDocument(
    "shopify_merchant",
    domain,
    "chats",
    chat.id,
    chat,
  );

  return createResponse(200, "Chat Started", {
    chat,
    message,
    token: merchant.access_token,
  });
};

export const fetchCustomerData = async (
  merchant: MerchantDocument,
  payload: ChatStartRequest,
) => {
  const {id: domain, access_token} = merchant;
  const {email, order_id} = payload;

  const shpat = await decryptMsg(access_token);
  const customer = await fetchShopifyCustomer(domain, shpat, email);
  if (!customer) return {customer: null, order: null};

  let order: CleanedCustomerOrder | null = null;
  if (order_id) {
    order = await fetchShopifyOrder(domain, shpat, order_id);
  }

  const last_order = customer.last_order_id;
  if (last_order && !order) {
    order = await fetchShopifyOrder(domain, shpat, `${last_order}`);
  }

  const cleaned_customer = cleanCustomerPayload(customer);
  return {customer: cleaned_customer, order: order};
};

export const respondToChat = async (
  domain: string,
  id: string,
  message: string,
) => {
  if (!domain || !message || !id) {
    return createResponse(400, "Missing params", null);
  }

  // Fetch chat data:
  const {data: chat_doc} = await fetchSubcollectionDocument(
    "shopify_merchant",
    domain,
    "chats",
    id,
  );

  const chat = chat_doc as ChatDocument;
  if (!chat) return createResponse(422, "Chat not found", null);

  // Fetch chat data:
  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "Merchant not found", null);

  const convo = generateChatMessages(chat.conversation);
  const history = convo + `\n- Customer: ${message}.\n`;

  // Classify message
  const classification = await classifyMessage(chat, history);

  // Build chat payload
  const blocks = buildResponsePayload(merchant, chat, classification, message);
  functions.logger.info({blocks});

  // Respond to chat
  const response = await respondToChatGPT(blocks);
  if (!response) return createResponse(400, "Error Sending", {response});

  // update chat
  const payload = respondToChatPayload(
    chat,
    merchant.timezone,
    response,
    message,
    classification,
  );
  functions.logger.info({conversation: payload.conversation});

  await updateSubcollectionDocument(
    "shopify_merchant",
    domain,
    "chats",
    id,
    payload,
  );

  return createResponse(200, "Responded", {response});
};

export const resolveChat = async (
  domain: string,
  id: string,
  type: "email" | "chat",
) => {
  if (!domain || !id) {
    return createResponse(400, "Missing params", null);
  }

  const sub_collection = type == "chat" ? "chats" : "emails";

  // Fetch chat data:
  const {data: doc} = await fetchSubcollectionDocument(
    "shopify_merchant",
    domain,
    sub_collection,
    id,
  );

  const chat = doc as ChatDocument | EmailDocument;
  if (!chat) return createResponse(422, "Chat not found", null);
  if (chat.status == "resolved") {
    return createResponse(409, "Chat Resovled", null);
  }

  // Generate Suggested Action Keyword
  const {action, prompt} = await generateSuggestedAction(chat);
  functions.logger.info({action, prompt});

  // Summarize
  const summary = (await generateSummary(prompt)) || "";

  // Create sentiment analysis
  const sentiment = (await generateSentimentGPT(prompt)) || "neutral";

  // Fetch Mercahant Doc
  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "Merchant not found", null);

  const actions = await automateAction(chat, merchant, type, action);

  // Build Resolve Chat Payload
  const payload = buildResolvedChatPayload(
    chat,
    merchant,
    action,
    actions,
    type,
    summary,
    sentiment,
  );
  functions.logger.info({resolved_saved: payload});

  // Update Doc
  await updateSubcollectionDocument(
    "shopify_merchant",
    domain,
    sub_collection,
    id,
    payload,
  );

  return createResponse(200, "Resolved", {chat: payload});
};

type AutomaticAction = {
  email: boolean;
  action: boolean;
  suggested_email: string;
  error: string;
};

export const automateAction = async (
  chat: ChatDocument | EmailDocument,
  merchant: MerchantDocument,
  type: "email" | "chat",
  suggested: SuggestedActions,
): Promise<AutomaticAction> => {
  const {performed, action, error} = await performActions(
    chat,
    type,
    suggested,
    merchant,
  );

  const suggested_email = generateSuggestedEmail(
    chat,
    suggested,
    merchant,
    action,
  );
  if (type == "email") {
    const time = getCurrentUnixTimeStampFromTimezone(merchant.timezone);
    chat.conversation = [
      ...chat.conversation,
      {
        time: time,
        is_note: false,
        message: suggested_email,
        sender: "agent",
        action: null,
        id: `${time}`,
        history_id: "",
        internal_date: String(time),
        from: "",
        subject: "",
        attachments: [],
      },
    ];
  }

  if (!performed) {
    return {
      email: false,
      action: performed,
      suggested_email,
      error: "",
    };
  }

  const email_sent = await sendEmail(chat, suggested_email, merchant);

  return {email: email_sent, action: performed, suggested_email, error};
};

export const fetchThread = async (domain: string, email: string) => {
  if (!domain || !email) return createResponse(400, "Missing params", null);

  // Fetch Chat
  const {data} = await fetchSubcollectionDocument(
    "shopify_merchant",
    domain,
    "chats",
    email,
  );
  const chat = data as ChatDocument;

  if (chat && chat.status == "open") {
    const convo = fetchChatMessages(chat.conversation);
    return createResponse(200, "Still Open", convo);
  }

  return createResponse(422, "Not Active", null);
};
