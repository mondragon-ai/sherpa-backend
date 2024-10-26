import {
  deleteSubcollectionDocument,
  fetchRootDocument,
  fetchSubcollectionDocument,
  updateSubcollectionDocument,
} from "../../../database/firestore";
import {
  fetchCustomerOrderList,
  fetchShopifyOrder,
} from "../../../networking/shopify/orders";
import {decryptMsg} from "../../../util/encryption";
import {createResponse} from "../../../util/errors";
import {MerchantDocument} from "../../../lib/types/merchant";
import {
  buildResolvedChatPayload,
  createChatPayload,
  respondToChatPayload,
} from "../../../lib/payloads/chats";
import {CleanedCustomerOrder} from "../../../lib/types/shopify/orders";
import {updateMerchantUsage} from "../../../networking/shopify/billing";
import {ChatDocument, ChatStartRequest} from "../../../lib/types/chats";
import {fetchShopifyProducts} from "../../../networking/shopify/products";
import {fetchShopifyCustomer} from "../../../networking/shopify/customers";
import {cleanCustomerPayload} from "../../../lib/payloads/shopify/customers";
import {classifyMessage} from "../../../lib/helpers/agents/classify";
import {buildResponsePayload} from "../../../lib/payloads/openai/respond";
import {respondToChatGPT} from "../../../networking/openAi/respond";
import {generateSuggestedAction} from "../../../lib/helpers/agents/resolve";
import {performActions} from "../../../lib/helpers/automation/actions";
import {
  generateSuggestedEmail,
  sendEmail,
} from "../../../lib/helpers/emails/emails";
import {SuggestedActions} from "../../../lib/types/shared";

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
  if (customer?.email && order?.email !== "") {
    if (order?.email !== email) {
      return createResponse(409, "Email Must Match", {chat: null});
    }
  }

  // Find if chat exists
  const {data: chat_doc} = await fetchSubcollectionDocument(
    "shopify_merchant",
    domain,
    "chats",
    email,
  );
  const chats = chat_doc as ChatDocument;

  // Create payload
  const {chat, message} = createChatPayload(
    merchant,
    chats,
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
    order = await fetchShopifyOrder(
      domain,
      shpat,
      `gid://shopify/Order/${last_order}`,
    );
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

  // Classify message
  const classification = await classifyMessage(chat, message);

  // Build chat payload
  const blocks = buildResponsePayload(merchant, chat, classification, message);

  // Respond to chat
  const response = await respondToChatGPT(message, blocks);
  if (!response) return createResponse(400, "Error Sending", {response});

  // update chat
  const payload = respondToChatPayload(
    chat,
    merchant.timezone,
    response,
    message,
    classification,
  );

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

  // Fetch chat data:
  const {data: chat_doc} = await fetchSubcollectionDocument(
    "shopify_merchant",
    domain,
    "chats",
    id,
  );
  const chat = chat_doc as ChatDocument;
  if (!chat) return createResponse(422, "Chat not found", null);

  if (chat.status == "resolved") {
    return createResponse(409, "Chat Resovled", null);
  }

  // Delete chat if convo == 2
  if (chat.conversation.length < 2) {
    await deleteSubcollectionDocument("shopify_merchant", domain, "chats", id);
    return createResponse(204, "Chat Deleted", null);
  }

  // Generate Suggested Actions
  const suggested = await generateSuggestedAction(chat, type);

  // ? Summarize -> summary

  // Fetch chat data:
  const {data} = await fetchRootDocument("shopify_merchant", domain);
  const merchant = data as MerchantDocument;
  if (!merchant) return createResponse(422, "Merchant not found", null);

  const actions = await automateAction(chat, merchant, type, suggested);
  console.log({actions});

  // Build Payload
  const payload = buildResolvedChatPayload(chat, merchant, suggested, actions);
  console.log({payload});

  // Update Doc
  //   await updateSubcollectionDocument(
  //     "shopify_merchant",
  //     domain,
  //     "chats",
  //     id,
  //     payload,
  //   );

  return createResponse(200, "Responded", null);
};

export const automateAction = async (
  chat: ChatDocument,
  merchant: MerchantDocument,
  type: "email" | "chat",
  suggested: SuggestedActions,
) => {
  // Perform Actions
  const performed = await performActions(chat, type, suggested, merchant); // ! Extract action string

  // Build Suggested Email
  const suggested_email = generateSuggestedEmail(chat, suggested, merchant); // ! Add action string

  // Send Suggested Email
  const email_sent = await sendEmail(chat, type, suggested_email, merchant);

  return {email: email_sent, action: performed, suggested_email};
};
