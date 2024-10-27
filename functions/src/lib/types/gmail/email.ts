export type EmailMessage = {
  id: string;
  threadId: string;
  internalDate: string;
  sender: "agent" | "customer";
  from: string;
  to: string;
  subject: string;
  message: string;
  image: any[];
};

export type EmailFetchResponseData = {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: Payload;
  sizeEstimate: number;
  historyId: string;
  internalDate: string;
};

type Payload = {
  partId: string;
  mimeType: string;
  filename: string;
  headers: Header[];
  body: Body;
  parts: Part[];
};

type Header = {
  name: string;
  value: string;
};

type Body = {
  size: number;
  data?: string;
};

type Part = {
  partId: string;
  mimeType: string;
  filename: string;
  headers: Header[];
  body: Body;
};

export type GmailWatchResponse = {
  config: Config;
  data: {
    historyId: string;
    expiration: string;
  };
  headers: Headers;
  status: number;
  statusText: string;
  request: {
    responseURL: string;
  };
};

type Config = {
  url: string;
  method: string;
  apiVersion: string;
  userAgentDirectives: UserAgentDirective[];
  data: RequestData;
  headers: RequestHeaders;
  params: Record<string, unknown>;
  retry: boolean;
  body: string;
  responseType: string;
};

type UserAgentDirective = {
  product: string;
  version: string;
  comment: string;
};

type RequestData = {
  topicName: string;
  labelIds: string[];
  labelFilterBehavior: string;
};

type RequestHeaders = {
  "x-goog-api-client": string;
  "Accept-Encoding": string;
  "User-Agent": string;
  Authorization: string;
  "Content-Type": string;
};

type Headers = {
  "alt-svc": string;
  "cache-control": string;
  "content-encoding": string;
  "content-type": string;
  date: string;
  server: string;
  "transfer-encoding": string;
  vary: string;
  "x-content-type-options": string;
  "x-frame-options": string;
  "x-xss-protection": string;
};

export type GmailNotifications = {emailAddress: string; historyId: number};

export type CleanedEmail = {
  id: string;
  threadId: string;
  historyId: string;
  snippet: string;
  internalDate: string;
  from: string;
  subject: string;
  content: string[];
  created_at: number;
};
