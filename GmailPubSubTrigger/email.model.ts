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
    required: true,
  },
  is_meeting_required: {
    type: Boolean,
    required: true,
  },
  sentiment: {
    type: SchemaTypes.String,
    required: true,
  },
  category: {
    type: [SchemaTypes.String],
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  attachments: {
    type: Boolean,
    required: true,
  },
  priority: {
    type: SchemaTypes.String,
    required: true,
  },
  due_date: {
    type: String,
    required: true,
  },
  follow_up_required: {
    type: Boolean,
    required: true,
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
    required: true,
  },
  sender_name: {
    type: String,
    required: true,
  },
  sender_email: {
    type: String,
    required: true,
  },
});

// Define the MongoDB schema for storing email data
const EmailSchema = new mongoose.Schema<Email>({
  email: {
    type: String,
    required: true,
  },
  messageId: {
    type: String,
    required: true,
  },
  publishTime: {
    type: Date,
    required: true,
  },
  body: {
    type: String,
  },
  category: emailCategoryResponseSchema,
});

// Create the Mongoose model
export const EmailModel = mongoose.model("Email", EmailSchema);
