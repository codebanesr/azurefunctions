import axios from "axios";
import { calendar_v3 } from "googleapis";
import { toRFC3339Timestamp } from "../utils/date.utils";

export async function getCalendarEvents(
  accessToken: string,
  calendarId: string,
  startDate: Date,
  endDate: Date
) {
  const response = await axios.get<calendar_v3.Schema$Events>(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        timeMax: toRFC3339Timestamp(startDate),
        timeMin: toRFC3339Timestamp(endDate),
        // timeZone: ''
      },
    }
  );

  return response.data.items;
}
