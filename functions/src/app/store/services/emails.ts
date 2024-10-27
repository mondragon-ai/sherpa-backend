import {
  deleteSubcollectionDocument,
  fetchPaginatedSubcollection,
  fetchSubcollectionCollection,
  fetchSubcollectionDocument,
  simpleSearch,
  updateSubcollectionDocument,
} from "../../../database/firestore";
import {createResponse} from "../../../util/errors";
import {EmailDocument} from "../../../lib/types/emails";
import {getCurrentUnixTimeStampFromTimezone} from "../../../util/formatters/time";

export const fetchEmails = async (domain: string) => {
  if (!domain) return createResponse(400, "Missing Domain", null);

  const {data} = await fetchSubcollectionCollection(
    "shopify_merchant",
    domain,
    "emails",
  );
  const emails = data as EmailDocument[];
  if (!emails) return createResponse(422, "No emails found", null);

  return createResponse(200, "Fetched emails", emails);
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

export const rateChat = async (
  domain: string,
  id: string,
  rating: "postive" | "negative" | "neutral",
) => {
  if (!domain || !id || !rating) {
    return createResponse(400, "Missing params", null);
  }

  const time = getCurrentUnixTimeStampFromTimezone("America/New_York");
  await updateSubcollectionDocument("shopify_merchant", domain, "emails", id, {
    rating,
    updated_at: time,
  });

  return createResponse(200, "Rated email", null);
};

export const submitNote = async (domain: string, id: string, note: string) => {
  if (!domain || !id || !note) {
    return createResponse(400, "Missing params", null);
  }

  const {data} = await fetchSubcollectionDocument(
    "shopify_merchant",
    domain,
    "emails",
    id,
  );
  const email = data as EmailDocument;
  if (!email) return createResponse(422, "No email found", []);

  const time = getCurrentUnixTimeStampFromTimezone(email.timezone);
  email.updated_at = time;
  email.conversation = [
    ...email.conversation,
    {
      time: time,
      is_note: true,
      message: note,
      sender: "agent",
      action: null,
      id: "",
      history_id: "",
      internal_date: "",
      from: "",
      subject: "",
      attachments: [],
    },
  ];
  await updateSubcollectionDocument(
    "shopify_merchant",
    domain,
    "emails",
    id,
    email,
  );

  return createResponse(200, "Add Email Note", null);
};
