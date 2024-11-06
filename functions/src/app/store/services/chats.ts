import {
  deleteSubcollectionDocument,
  fetchPaginatedSubcollection,
  fetchSubcollectionCollection,
  fetchSubcollectionDocument,
  simpleSearch,
  updateSubcollectionDocument,
} from "../../../database/firestore";
import {createResponse} from "../../../util/errors";
import {ChatDocument} from "../../../lib/types/chats";
import {getCurrentUnixTimeStampFromTimezone} from "../../../util/formatters/time";

export const fetchChats = async (domain: string) => {
  if (!domain) return createResponse(400, "Missing Domain", null);

  const {data} = await fetchSubcollectionCollection(
    "shopify_merchant",
    domain,
    "chats",
  );
  const chats = data as ChatDocument[];
  if (!chats) return createResponse(422, "No chats found", []);

  return createResponse(200, "Fetched chats", chats);
};

export const fetchChat = async (domain: string, id: string) => {
  if (!domain || !id) return createResponse(400, "Missing params", null);

  const {data} = await fetchSubcollectionDocument(
    "shopify_merchant",
    domain,
    "chats",
    id,
  );
  const chat = data as ChatDocument;
  if (!chat) return createResponse(422, "No chat found", []);

  return createResponse(200, "Fetched chat", chat);
};

export const fetchNextChats = async (domain: string, time: string) => {
  if (!domain || !time) return createResponse(400, "Missing params", null);

  const {data} = await fetchPaginatedSubcollection(
    "shopify_merchant",
    domain,
    "chats",
    time,
    "prev",
  );
  const chats = data as ChatDocument[];
  if (!chats) return createResponse(422, "No chats found", null);

  return createResponse(200, "Fetched chats", chats);
};

export const filterChats = async (
  domain: string,
  query: "newest" | "open" | "action_required",
) => {
  if (!domain || !query) return createResponse(400, "Missing params", null);

  if (query == "newest") {
    const {data} = await fetchSubcollectionCollection(
      "shopify_merchant",
      domain,
      "chats",
    );

    const chats = data as ChatDocument[];
    if (!chats) return createResponse(422, "No chats found", []);

    return createResponse(200, "Fetched newest chats", chats);
  }

  const {data} = await simpleSearch(
    "shopify_merchant",
    domain,
    "chats",
    "status",
    query,
  );

  if (!data || !data.list) return createResponse(422, "No chats found", null);
  const chats = data.list as ChatDocument[];

  return createResponse(200, `Fetched ${query} chats`, chats);
};

export const deleteChat = async (domain: string, id: string) => {
  if (!domain || !id) return createResponse(400, "Missing params", null);

  await deleteSubcollectionDocument("shopify_merchant", domain, "chats", id);

  return createResponse(200, "Deleted chats", null);
};

export const rateChat = async (
  domain: string,
  id: string,
  rating: "postive" | "negative" | "neutral",
) => {
  if (!domain || !id || !rating) {
    return createResponse(400, "Missing params", null);
  }

  const time = getCurrentUnixTimeStampFromTimezone("America/New_York");
  await updateSubcollectionDocument("shopify_merchant", domain, "chats", id, {
    rating,
    updated_at: time,
  });

  return createResponse(200, "Rated chat", null);
};

export const submitNote = async (domain: string, id: string, note: string) => {
  if (!domain || !id || !note) {
    return createResponse(400, "Missing params", null);
  }

  const {data} = await fetchSubcollectionDocument(
    "shopify_merchant",
    domain,
    "chats",
    id,
  );
  const chat = data as ChatDocument;
  if (!chat) return createResponse(422, "No chat found", []);

  const time = getCurrentUnixTimeStampFromTimezone(chat.timezone);
  chat.updated_at = time;
  chat.conversation = [
    ...chat.conversation,
    {
      time: time,
      is_note: true,
      message: note,
      sender: "agent",
      action: null,
    },
  ];
  await updateSubcollectionDocument(
    "shopify_merchant",
    domain,
    "chats",
    id,
    chat,
  );

  return createResponse(200, "Add Chat Note", null);
};
