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
