import {
  deleteSubcollectionDocument,
  fetchPaginatedSubcollection,
  fetchSubcollectionCollection,
  simpleSearch,
} from "../../../database/firestore";
import {ChatDocument} from "../../../lib/types/chats";
import {createResponse} from "../../../util/errors";

export const fetchChats = async (domain: string) => {
  if (!domain) return createResponse(400, "Missing Domain", null);

  const {data} = await fetchSubcollectionCollection(
    "shopify_merchant",
    domain,
    "chats",
  );
  const chats = data as ChatDocument[];
  if (!chats) return createResponse(422, "No chats found", null);

  return createResponse(200, "Fetched chats", chats);
};

export const fetchNextChats = async (domain: string, time: string) => {
  if (!domain || !time) return createResponse(400, "Missing params", null);

  const {data} = await fetchPaginatedSubcollection(
    "shopify_merchant",
    domain,
    "chats",
    time,
    "next",
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

  const {data} = await simpleSearch(
    "shopify_merchant",
    domain,
    "chats",
    "status",
    query,
  );
  if (!data || !data.list) return createResponse(422, "No chats found", null);
  const chats = data.list as ChatDocument[];

  return createResponse(200, "Fetched chats", chats);
};

export const deleteChat = async (domain: string, id: string) => {
  if (!domain || !id) return createResponse(400, "Missing Domain", null);

  await deleteSubcollectionDocument("shopify_merchant", domain, "chats", id);

  return createResponse(200, "Deleted chats", null);
};
