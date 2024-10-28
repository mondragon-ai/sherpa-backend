import * as functions from "firebase-functions";
import * as Tasks from "@google-cloud/tasks";

/**
 * Trigger to complete Chat Bot Summerization in 30 min from initial chat creation.
 *
 * @param domain - The unique identifier of the merchant to whom the order belongs (shopify).
 * @param chat_uid - The unique identifier of the Chat Ticket created.
 */
export const resolveTicket = async (
  domain: string,
  email: string,
  type: "email" | "chat",
) => {
  const client = new Tasks.v2.CloudTasksClient();

  const project = "sherpa-dc1fe";
  const queue = "CompleteChats";

  const location = "us-central1";
  const url = `https://us-central1-sherpa-dc1fe.cloudfunctions.net/${domain}/resolve/${email}?type=${type}`;

  // Construct the fully qualified queue name.
  const parent = client.queuePath(project, location, queue);

  const task = {
    httpRequest: {
      headers: {
        "Content-Type": "application/json",
      },
      httpMethod: HttpMethod.POST,
      url,
      body: null,
    },
    scheduleTime: {
      seconds: Math.floor(Date.now() / 1000) + 30 * 60,
    },
  };

  try {
    const [response] = await client.createTask({parent, task});

    functions.logger.info(`Created task ${response.name}`);
  } catch (error) {
    functions.logger.error(`Failed to create task: ${error}`);
  }
};

enum HttpMethod {
  HTTP_METHOD_UNSPECIFIED = 0,
  POST = 1,
  GET = 2,
  HEAD = 3,
  PUT = 4,
  DELETE = 5,
  PATCH = 6,
  OPTIONS = 7,
}
