import * as functions from "firebase-functions";
import * as Tasks from "@google-cloud/tasks";

/**
 * Trigger to complete Chat Bot Summerization in 30 min from initial chat creation.
 *
 * @param domain - The unique identifier of the merchant to whom the order belongs (shopify).
 * @param chat_uid - The unique identifier of the Chat Ticket created.
 */
export const sendEmail = async (domain: string, chat_uuid: string) => {
  const client = new Tasks.v2.CloudTasksClient();

  const project = "sherpa-dc1fe";
  const queue = "SendEmail";

  const location = "us-central1";
  const url = "https://us-central1-sherpa-dc1fe.cloudfunctions.net/apps";

  const parent = client.queuePath(project, location, queue);

  const task = {
    httpRequest: {
      headers: {
        "Content-Type": "application/json",
      },
      httpMethod: "POST" as any,
      url,
      body: Buffer.from(
        JSON.stringify({
          domain,
          chat_uuid,
        }),
      ).toString("base64"),
    },
    scheduleTime: {
      seconds: Math.floor(Date.now() / 1000) + 10 * 60,
    },
  };

  try {
    const [response] = await client.createTask({parent, task});

    functions.logger.info(`Created task ${response.name}`);
  } catch (error) {
    functions.logger.error(`Failed to create task: ${error}`);
  }
};
