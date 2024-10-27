import * as functions from "firebase-functions";

export const gmailEmailCreated = functions.firestore
  .document("/shopify_merchant/{shopify_merchantID}/emails/{chatID}")
  .onCreate(async (snap, _context) => {
    console.log("CREATED");
  });

export const gmailEmailDeleted = functions.firestore
  .document("/shopify_merchant/{shopify_merchantID}/emails/{chatID}")
  .onDelete(async (snap, _context) => {
    console.log("DELETED");
  });
