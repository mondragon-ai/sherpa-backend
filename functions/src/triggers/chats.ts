import * as functions from "firebase-functions";
import {ChatDocument} from "../lib/types/chats";

import {algoliaChatCreatePayload} from "../lib/payloads/chats";
import {deleteFromAlgolia, updateToAlgolia} from "../database/algolia";
import {createTicketAnalytics} from "../lib/helpers/analytics/create";
import {resolveTicketAnalytics} from "../lib/helpers/analytics/resolved";
import {resolveTicket} from "../queues/resolveTicket";

export const chatsCreated = functions.firestore
  .document("/shopify_merchant/{domain}/chats/{chatID}")
  .onCreate(async (snap) => {
    console.log("CREATED");

    const data = snap.exists ? snap.data() : null;
    if (!data) return;

    const chat = data as unknown as ChatDocument;
    const {id, domain, status} = chat;

    if (status !== "open") {
      return;
    }

    // Start Timer
    await resolveTicket(domain, id, "chat");

    // Add Algolia
    const payload = algoliaChatCreatePayload(chat);
    await updateToAlgolia("sherpa_chats", domain, payload);

    // Update Analytics - New Ticket
    await createTicketAnalytics("chat", chat);
  });

export const chatUpdated = functions.firestore
  .document("/shopify_merchant/{domain}/chats/{chatID}")
  .onUpdate(async (snap) => {
    console.log("UPDATE");

    const before = snap.before.exists ? snap.before.data() : null;
    if (!before) return;
    const before_chat = before as unknown as ChatDocument;

    const after = snap.after.exists ? snap.after.data() : null;
    if (!after) return;
    const after_chat = after as unknown as ChatDocument;
    const {id, domain} = after_chat;

    console.log(`[${before_chat.status}, ${after_chat.status}]`);

    // Update Analytics - New Ticket
    if (before_chat.status !== "open" && after_chat.status == "open") {
      await createTicketAnalytics("chat", after_chat);
      await resolveTicket(domain, id, "chat");
    }

    // Update Analytics - Resolved Ticket
    if (before_chat.status == "open" && after_chat.status !== "open") {
      await resolveTicketAnalytics("chat", after_chat);
    }
  });

export const chatDeleted = functions.firestore
  .document("/shopify_merchant/{domain}/chats/{chatID}")
  .onDelete(async (snap) => {
    console.log("DELETED");

    const data = snap.exists ? snap.data() : null;
    if (!data) return;

    const chat = data as unknown as ChatDocument;
    const {id, domain} = chat;

    // Delete From Algolia
    await deleteFromAlgolia("sherpa_chats", domain, id);
  });
