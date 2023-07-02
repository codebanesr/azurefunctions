import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import axios from "axios";

const GOOGLE_CALENDAR_API_ENDPOINT = "https://www.googleapis.com/calendar/v3";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const dateParam = req.query.date; // Get the date from the query parameter
    const timeParam = req.query.time; // Get the time from the query parameter (optional)
    const durationParam = req.query.duration; // Get the duration from the query parameter (optional)

    if (!dateParam) {
      context.res = {
        status: 400,
        body: "Missing 'date' query parameter.",
      };
      return;
    }

    const date = new Date(dateParam);

    if (isNaN(date.getTime())) {
      context.res = {
        status: 400,
        body: "Invalid date format. Please provide a valid date.",
      };
      return;
    }

    const duration = durationParam ? parseInt(durationParam) : 30; // Default duration is 30 minutes

    if (isNaN(duration) || duration <= 0) {
      context.res = {
        status: 400,
        body: "Invalid duration format. Please provide a valid positive integer duration in minutes.",
      };
      return;
    }

    // Define the start and end time for the day
    const startTime = new Date(date);
    startTime.setHours(0, 0, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(23, 59, 59, 999);

    // Obtain the access token
    const accessToken = await getAccessToken(req);

    // Make a request to Google Calendar API to retrieve events for the given date
    const response = await axios.get(`${GOOGLE_CALENDAR_API_ENDPOINT}/events`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: true,
      },
    });

    const events = response.data.items || [];

    if (events.length === 0) {
      // No events for the given date, consider the whole day as an empty time slot
      const emptySlot = {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
      };

      // Set the meeting on the empty slot
      await setMeeting(emptySlot, duration, accessToken, timeParam);
    } else {
      // Find the available time slots within the day
      const availableSlots = findAvailableTimeSlots(startTime, endTime, events);

      if (availableSlots.length === 0) {
        context.res = {
          status: 200,
          body: "No available time slots for the given date.",
        };
        return;
      }

      // Set the meeting on the first available time slot
      await setMeeting(
        { end: availableSlots[0].start, start: availableSlots[0].end },
        duration,
        accessToken
      );
    }

    context.res = {
      status: 200,
      body: "Meeting successfully scheduled.",
    };
  } catch (error) {
    console.error("Error:", error);
    context.res = {
      status: 500,
      body: "An error occurred while processing the request.",
    };
  }
};

async function getAccessToken(req: HttpRequest): Promise<string> {
  const { email } = req.query;

  if (!email) {
    throw new Error("Email is a must");
  }

  throw new Error("getAccessToken not implemented");
}

async function setMeeting(
  timeSlot: { start: string; end: string },
  duration: number,
  accessToken: string,
  timeParam?: string
): Promise<void> {
  const meetingStart = timeParam
    ? new Date(timeParam)
    : new Date(timeSlot.start);
  const meetingEnd = new Date(meetingStart.getTime() + duration * 60 * 1000); // Meeting duration in minutes

  // Logic to set the meeting using the obtained start and end times
  // (e.g., make a request to Google Calendar API to create a new event)
  // Replace with your own implementation

  // Example using Axios:
  // await axios.post(`${GOOGLE_CALENDAR_API_ENDPOINT}/events`, {
  //   start: { dateTime: meetingStart.toISOString() },
  //   end: { dateTime: meetingEnd.toISOString() },
  //   // Other event details
  //   // ...
  // }, {
  //   headers: {
  //     Authorization: `Bearer ${accessToken}`,
  //   },
  // });
}

function findAvailableTimeSlots(
  startTime: Date,
  endTime: Date,
  events: any[]
): any[] {
  // Logic to find the available time slots within the given start and end time
  // based on the events retrieved from the Google Calendar API
  // Replace with your own implementation
  // You can use libraries like moment.js for easier date/time manipulations

  const occupiedSlots = events.map((event) => ({
    start: new Date(event.start.dateTime),
    end: new Date(event.end.dateTime),
  }));

  // Example implementation: Find gaps between occupied slots
  const availableSlots = [];
  let previousSlotEnd = startTime;

  for (const slot of occupiedSlots) {
    if (previousSlotEnd < slot.start) {
      availableSlots.push({
        start: previousSlotEnd.toISOString(),
        end: slot.start.toISOString(),
      });
    }
    previousSlotEnd = slot.end;
  }

  if (previousSlotEnd < endTime) {
    availableSlots.push({
      start: previousSlotEnd.toISOString(),
      end: endTime.toISOString(),
    });
  }

  return availableSlots;
}

export default httpTrigger;
