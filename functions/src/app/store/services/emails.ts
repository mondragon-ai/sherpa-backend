import {
  deleteSubcollectionDocument,
  fetchPaginatedSubcollection,
  fetchSubcollectionCollection,
  simpleSearch,
} from "../../../database/firestore";
import {createResponse} from "../../../util/errors";
import {EmailDocument} from "../../../lib/types/emails";

export const fetchEmails = async (domain: string) => {
  if (!domain) return createResponse(400, "Missing Domain", null);

  const {data} = await fetchSubcollectionCollection(
    "shopify_merchant",
    domain,
    "emails",
  );
  const email = data as EmailDocument[];
  if (!email) return createResponse(422, "No emails found", null);

  return createResponse(200, "Fetched emails", email);
};

export const fetchNextEmails = async (domain: string, time: string) => {
  if (!domain || !time) return createResponse(400, "Missing params", null);

  const {data} = await fetchPaginatedSubcollection(
    "shopify_merchant",
    domain,
    "emails",
    time,
    "next",
  );
  const emails = data as EmailDocument[];
  if (!emails) return createResponse(422, "No emails found", null);

  return createResponse(200, "Fetched emails", emails);
};

export const filterEmails = async (
  domain: string,
  query: "newest" | "open" | "action_required",
) => {
  if (!domain || !query) return createResponse(400, "Missing params", null);

  const {data} = await simpleSearch(
    "shopify_merchant",
    domain,
    "emails",
    "status",
    query,
  );
  if (!data || !data.list) return createResponse(422, "No emails found", null);
  const emails = data.list as EmailDocument[];

  return createResponse(200, "Fetched emails", emails);
};

export const deleteEmail = async (domain: string, id: string) => {
  if (!domain || !id) return createResponse(400, "Missing Domain", null);

  await deleteSubcollectionDocument("shopify_merchant", domain, "emails", id);

  return createResponse(200, "Deleted email", null);
};
