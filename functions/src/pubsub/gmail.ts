import * as functions from "firebase-functions";

const settings: functions.RuntimeOptions = {
  timeoutSeconds: 120,
};

export const receiveGmailNotification = functions
  .runWith(settings)
  .pubsub.topic("gmail-messages")
  .onPublish(async (message) => {
    const data = (await message.json) as unknown;
    console.log({data});
  });
