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
