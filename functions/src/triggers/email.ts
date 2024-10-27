import * as functions from "firebase-functions";

export const emailCreated = functions.firestore
  .document("/shopify_merchant/{shopify_merchantID}/emails/{chatID}")
  .onCreate(async (snap, _context) => {
    console.log("CREATED");
  });

export const emailUpdated = functions.firestore
  .document("/shopify_merchant/{shopify_merchantID}/emails/{chatID}")
  .onUpdate(async (snap, _context) => {
    console.log("UPDATE");
  });

export const emailDeleted = functions.firestore
  .document("/shopify_merchant/{shopify_merchantID}/emails/{chatID}")
  .onDelete(async (snap, _context) => {
    console.log("DELETED");
  });
