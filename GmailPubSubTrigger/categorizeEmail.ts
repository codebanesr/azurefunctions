import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { EmailCategoryResponse } from './oai.interface';

const apiUrl = process.env.OAI_URL;
const apiKey = process.env.OAI_KEY;

async function sendRequest(config: AxiosRequestConfig): Promise<EmailCategoryResponse> {
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
    const categories = ['Inquiries', 'Requests', 'Meeting Invitations', 'Meeting Updates', 'Meeting Agendas', 'Feedback', 'Complaints', 'Sales Inquiries', 'Job Applications', 'Notifications', 'Confirmations', 'Reminders', 'Announcements', 'Invitations', 'Newsletters', 'Subscription Updates', 'Payment Reminders', 'Account Notifications', 'Travel Itineraries', 'Technical Support'];

    const messages = [
      {
        role: 'system',
        content: `Please complete this json from the message and return it after filling corresponding values in json value fields
{
  "urgency": "[low, medium, high]",
  "is_meeting_required": "[true, false]",
  "sentiment": "[positive, neutral, negative]",
  "category": ${JSON.stringify(categories)},
  "recipient": "[Enter recipient's name or email address]",
  "attachments": "[true, false]",
  "priority": "[low, normal, high]",
  "due_date": "[Enter due date or deadline]",
  "follow_up_required": "[true, false]",
  "cc": ["[cc_recipient1]", "[cc_recipient2]"],
  "bcc": ["[bcc_recipient1]", "[bcc_recipient2]"],
  "relevant_links": ["[link1]", "[link2]"],
  "action_items": ["[action_item1]", "[action_item2]"],
  "language": "[Enter email language]",
  "sender_name": "[Enter sender's name]",
  "sender_email": "[Enter sender's email address]"
}`
      },
      {
        role: 'user',
        content: emailText
      }
    ];

    const config: AxiosRequestConfig = {
      url: apiUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      data: {
        messages,
        max_tokens: 350,
        temperature: 0.2,
        frequency_penalty: 0,
        presence_penalty: 0,
        top_p: 0.95,
        stop: null
      }
    };

    return sendRequest(config);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
