export type AnalyticsDocument = {
  id: number;
  total_chats: LineChart[];
  total_emails: LineChart[];
  total_volume: LineChart[];
  resolution_ratio: {sherpa: number; human: number};
  csat: {positive: number; negative: number; neutral: number};
  top_errors: Record<string, number>;
  top_issues: Record<string, number>;
  top_tickets: Record<string, number>;
  sentiment_analysis: {positive: number; negative: number; neutral: number};
  created_at: number;
  updated_at: number;
  category_csat: Record<
    string,
    {positive: number; neutral: number; negative: number}
  >;
  amount_saved: LineChart[];
};

export type LineChart = {
  date: string;
  value: number;
};

export type TimeFrameTypes =
  | "today"
  | "seven_days"
  | "thirty_days"
  | "ninety_days"
  | "twelve_months";
