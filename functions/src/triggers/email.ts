import * as functions from "firebase-functions";
import {EmailDocument} from "../lib/types/emails";
import {resolveTicket} from "../queues/resolveTicket";
import {algoliaChatCreatePayload} from "../lib/payloads/chats";
import {createTicketAnalytics} from "../lib/helpers/analytics/create";
import {deleteFromAlgolia, updateToAlgolia} from "../database/algolia";
import {resolveTicketAnalytics} from "../lib/helpers/analytics/resolved";

export const emailCreated = functions.firestore
  .document("/shopify_merchant/{shopify_merchantID}/emails/{chatID}")
  .onCreate(async (snap) => {
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
    await createTicketAnalytics("email", email);
  });

export const emailUpdated = functions.firestore
  .document("/shopify_merchant/{shopify_merchantID}/emails/{chatID}")
  .onUpdate(async (snap) => {
    console.log("UPDATE");

    const before = snap.before.exists ? snap.before.data() : null;
    if (!before) return;
    const before_emails = before as unknown as EmailDocument;

    const after = snap.after.exists ? snap.after.data() : null;
    if (!after) return;
    const after_emails = after as unknown as EmailDocument;
    const {id, domain} = after_emails;

    console.log(`[${before_emails.status}, ${after_emails.status}]`);

    // Update Analytics - New Ticket
    if (before_emails.status !== "open" && after_emails.status == "open") {
      await createTicketAnalytics("email", after_emails);
      await resolveTicket(domain, id, "email");
    }

    // Update Analytics - Resolved Ticket
    if (before_emails.status == "open" && after_emails.status !== "open") {
      await resolveTicketAnalytics("email", after_emails);
    }
  });

export const emailDeleted = functions.firestore
  .document("/shopify_merchant/{shopify_merchantID}/emails/{chatID}")
  .onDelete(async (snap) => {
    console.log("DELETED");
    const data = snap.exists ? snap.data() : null;
    if (!data) return;

    const emails = data as unknown as EmailDocument;
    const {id, domain} = emails;

    // Delete From Algolia
    await deleteFromAlgolia("sherpa_emails", domain, id);
  });
