import axios from "axios";

export async function getPrimaryCalendar(accessToken: string): Promise<string> {
  const response = await axios.get(
    `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data.items[0].id;
}
