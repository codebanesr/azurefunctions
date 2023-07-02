import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { EmailCategoryResponse } from "../utils/oai.interface";
import { gmail_v1 } from "googleapis";
import { Context } from "vm";
import { decode } from "js-base64";

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

// Function to categorize the email (modify this logic as per your categorization requirements)
export async function categorizeEmail(
  emailData: gmail_v1.Schema$Message,
  context: Context
) {
  const { body, parts, mimeType } = emailData.payload || {};
  let data = "";

  if (mimeType === "text/html") {
    context.res = {
      status: 200,
      body: "Cannot parse html content right now!",
    };

    return;
  }

  const logError = (message: string) => {
    context.log.error(message);
    // You can customize the error handling logic here
  };

  const mimeHandlers = {
    "text/plain": (part: any) => {
      try {
        return decode(part.body.data);
      } catch (error) {
        logError("Error decoding text/plain part");
        return "";
      }
    },
    "text/html": (part: any) => {
      try {
        // will handle it later
        return "";
        // return decode(part.body.data);
      } catch (error) {
        logError("Error decoding text/html part");
        return "";
      }
    },
    "application/octet-stream": (part: any) => {
      return decode(part.body.data.toString());
    },
  };

  const processBody = (emailBody: any) => {
    if (emailBody?.size > 0) {
      try {
        return decode(emailBody.data);
      } catch (error) {
        logError("Error decoding email body");
        return "";
      }
    }
    return "";
  };

  const processPart = (part: any) => {
    const handler = mimeHandlers[part.mimeType];
    if (handler) {
      return handler(part);
    } else {
      // Handle other mime types if necessary
      return "";
    }
  };

  if (body.size > 0) {
    data = processBody(body);
  } else if (parts?.length > 0) {
    for (const part of parts) {
      data += processPart(part);
    }
  } else {
    // Handle the case when both body and parts are missing or empty
  }

  console.log({ data: JSON.stringify(data, null, 2) });

  if (!data) {
    return;
  }
  const category = await categorizeEmailAi(data);
  return { category, data };
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
