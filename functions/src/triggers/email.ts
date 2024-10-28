import * as functions from "firebase-functions";
import {EmailDocument} from "../lib/types/emails";
import {resolveTicket} from "../queues/resolveTicket";
import {algoliaChatCreatePayload} from "../lib/payloads/chats";
import {deleteFromAlgolia, updateToAlgolia} from "../database/algolia";

export const emailCreated = functions.firestore
  .document("/shopify_merchant/{shopify_merchantID}/emails/{chatID}")
  .onCreate(async (snap, _context) => {
    console.log("CREATED");

    const data = snap.exists ? snap.data() : null;
    if (!data) return;

    const email = data as unknown as EmailDocument;
    const {id, domain} = email;

    // Start Timer
    await resolveTicket(domain, id, "email");

    // Add Algolia
    const payload = algoliaChatCreatePayload(email);
    await updateToAlgolia("sherpa_emails", domain, payload);

    // Update Analytics - New Ticket
    // await createTicketAnalytics("chat", chat);
  });

export const emailUpdated = functions.firestore
  .document("/shopify_merchant/{shopify_merchantID}/emails/{chatID}")
  .onUpdate(async (snap, _context) => {
    console.log("UPDATE");

    const before = snap.before.exists ? snap.before.data() : null;
    if (!before) return;
    const before_emails = before as unknown as EmailDocument;

    const after = snap.after.exists ? snap.after.data() : null;
    if (!after) return;
    const after_emails = after as unknown as EmailDocument;

    console.log(`[${before_emails.status}, ${after_emails.status}]`);

    // TODO: Update Analytics - New Ticket
  });

export const emailDeleted = functions.firestore
  .document("/shopify_merchant/{shopify_merchantID}/emails/{chatID}")
  .onDelete(async (snap, _context) => {
    console.log("DELETED");
    const data = snap.exists ? snap.data() : null;
    if (!data) return;

    const emails = data as unknown as EmailDocument;
    const {id, domain} = emails;

    // Delete From Algolia
    await deleteFromAlgolia("sherpa_emails", domain, id);
  });
