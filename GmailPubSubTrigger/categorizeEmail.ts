import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { EmailCategoryResponse } from "./oai.interface";

const apiUrl = process.env.OAI_URL;
const apiKey = process.env.OAI_KEY;

async function sendRequest(
  config: AxiosRequestConfig
): Promise<EmailCategoryResponse> {
  try {
    const response: AxiosResponse<any> = await axios(config);
    const o = response.data;

    return JSON.parse(o.choices[0].message.content);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function categorizeEmailAi(emailText: string) {
  try {
    const categories = [
      "Inquiries",
      "Requests",
      "Meeting Invitations",
      "Meeting Updates",
      "Meeting Agendas",
      "Feedback",
      "Complaints",
      "Sales Inquiries",
      "Job Applications",
      "Notifications",
      "Confirmations",
      "Reminders",
      "Announcements",
      "Invitations",
      "Newsletters",
      "Subscription Updates",
      "Payment Reminders",
      "Account Notifications",
      "Travel Itineraries",
      "Technical Support",
    ];

    const messages = [
      {
        role: "system",
        content: `Please extract the following information from the provided text and fill in the corresponding fields of this JSON schema, unsubscribe link is always relevant if it exists:
        {
          "urgency": "Describe the urgency of the message [low, medium, high]",
          "is_meeting_required": "Specify whether a meeting is required [true, false]",
          "sentiment": "Indicate the sentiment of the message [positive, neutral, negative]",
          "category": "Enter the categories as a JSON string",
          "recipient": "Enter the recipient's name or email address",
          "attachments": "Specify if there are any attachments [true, false]",
          "priority": "Specify the priority of the message [low, normal, high]",
          "due_date": "Enter the due date or deadline",
          "follow_up_required": "Specify if a follow-up is required [true, false]",
          "cc": ["Enter cc_recipient1", "Enter cc_recipient2"],
          "bcc": ["Enter bcc_recipient1", "Enter bcc_recipient2"],
          "relevant_links": ["Enter link1", "Enter link2"],
          "action_items": ["Enter action_item1", "Enter action_item2"],
          "language": "Enter the email language",
          "sender_name": "Enter the sender's name",
          "sender_email": "Enter the sender's email address"
        }`,
      },
      {
        role: "user",
        content: emailText,
      },
    ];

    const config: AxiosRequestConfig = {
      url: apiUrl,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      data: {
        messages,
        max_tokens: 350,
        temperature: 0.2,
        frequency_penalty: 0,
        presence_penalty: 0,
        top_p: 0.95,
        stop: null,
      },
    };

    return sendRequest(config);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
