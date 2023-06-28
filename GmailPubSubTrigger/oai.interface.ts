export interface EmailCategoryResponse {
  urgency: "low" | "medium" | "high";
  is_meeting_required: boolean;
  sentiment: "positive" | "negative" | "neutral";
  category: "Announcements" | "Updates" | "Reminders" | "Requests" | "Other";
  recipient: string;
  attachments: boolean;
  priority: "low" | "normal" | "high";
  due_date: string;
  follow_up_required: boolean;
  cc: string[];
  bcc: string[];
  relevant_links: string[];
  action_items: string[];
  language: "English" | "Spanish" | "French" | "German" | "Other";
  sender_name: string;
  sender_email: string;
}
