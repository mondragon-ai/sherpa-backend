import {
  deleteSubcollectionDocument,
  fetchSubcollectionCollection,
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

export const deleteChat = async (domain: string, id: string) => {
  if (!domain || !id) return createResponse(400, "Missing Domain", null);

  await deleteSubcollectionDocument("shopify_merchant", domain, "chats", id);

  return createResponse(200, "Deleted chats", null);
};
