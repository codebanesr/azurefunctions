import axios from "axios";
import { calendar_v3 } from "googleapis";

export async function getCalendarEvents(accessToken: string, calendarId: string) {
  const response = await axios.get<calendar_v3.Schema$Events>(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data.items;
}
