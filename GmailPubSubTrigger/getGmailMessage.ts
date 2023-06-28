import axios from "axios";
import { gmail_v1 } from "googleapis";

export async function getGmailMessages(
  accessToken: string,
  userId: string,
  msgId: string
): Promise<gmail_v1.Schema$Message> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${msgId}`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.get<any>(url, { headers });
    return response.data;
  } catch (err) {
    return err;
  }
}
