import axios from "axios";
import { gmail_v1 } from "googleapis";
import { fetchGmailHistory } from "./getGmailHistory";

export async function getGmailMessages(
  accessToken: string,
  userId: string,
  startingHistoryId
): Promise<gmail_v1.Schema$Message> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  try {
    /**********************************************************************************************************************
     * CURRENTLY ONLY PROCESSING EMAIL FOR WHICH PUSH NOTIFICATION HAS ARRIVED, AS THIS WOULD PREVENT DUPLICATION FOR NOW *
     *                           BETTER TECHNIQUE WILL BE USED, WITH ACKNOWLEDGEMENT IN FUTURE                            *
     **********************************************************************************************************************/
    const gmailHistory = await fetchGmailHistory(userId, accessToken, startingHistoryId);
    const messageId = gmailHistory.history[0].messages[0].id;
    const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${messageId}?format=full`;
    const response = await axios.get<any>(url, { headers });
    return response.data;
  } catch (err) {
    console.error(err);
    return err;
  }
}
