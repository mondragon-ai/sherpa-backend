import * as functions from "firebase-functions";

export const chatsCreated = functions.firestore
  .document("/shopify_merchant/{domain}/chats/{chatID}")
  .onCreate(async (snap, _context) => {
    console.log("CREATED");
  });

export const chatUpdated = functions.firestore
  .document("/shopify_merchant/{domain}/chats/{chatID}")
  .onUpdate(async (snap, _context) => {
    console.log("UPDATE");
  });

export const chatDeleted = functions.firestore
  .document("/shopify_merchant/{domain}/chats/{chatID}")
  .onDelete(async (snap, _context) => {
    console.log("DELETED");
  });
