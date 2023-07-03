import axios from "axios";
import { calendar_v3 } from "googleapis";

export async function getPrimaryCalendar(accessToken: string) {
  const response = await axios.get<calendar_v3.Calendar>(
    `https://www.googleapis.com/calendar/v3/users/me/primary`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  return response.data;
}
