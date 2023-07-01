import mongoose, { SchemaTypes } from "mongoose";
import { EmailCategoryResponse } from "./oai.interface";

interface Email {
  email: string;
  messageId: string;
  publishTime: Date;
  body?: string;
  category?: string;
}

const emailCategoryResponseSchema = new mongoose.Schema<EmailCategoryResponse>({
  urgency: {
    type: SchemaTypes.String,
  },
  is_meeting_required: {
    type: Boolean,
  },
  sentiment: {
    type: SchemaTypes.String,
  },
  category: {
    type: [SchemaTypes.String],
  },
  recipient: {
    type: String,
  },
  attachments: {
    type: Boolean,
  },
  priority: {
    type: SchemaTypes.String,
  },
  due_date: {
    type: String,
  },
  follow_up_required: {
    type: Boolean,
  },
  cc: {
    type: [String],
    default: [],
  },
  bcc: {
    type: [String],
    default: [],
  },
  relevant_links: {
    type: [String],
    default: [],
  },
  action_items: {
    type: [String],
    default: [],
  },
  language: {
    type: SchemaTypes.String,
  },
  sender_name: {
    type: String,
  },
  sender_email: {
    type: String,
  },
});

// Define the MongoDB schema for storing email data
const EmailSchema = new mongoose.Schema<Email>({
  email: {
    type: String,
  },
  messageId: {
    type: String,
  },
  publishTime: {
    type: Date,
  },
  body: {
    type: String,
  },
  category: emailCategoryResponseSchema,
});

// Create the Mongoose model
export const EmailModel = mongoose.model("Email", EmailSchema);
