import axios from "axios";
import { gmail_v1 } from "googleapis";

export async function fetchGmailHistory(
  userId: string,
  accessToken: string,
  startHistoryId: string
) {
  const apiUrl = `https://gmail.googleapis.com/gmail/v1/users/${userId}/history?startHistoryId=${startHistoryId}`;

  const response = await axios.get<gmail_v1.Schema$ListHistoryResponse>(
    apiUrl,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}
