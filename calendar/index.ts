import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import axios from "axios";
import { getAccessTokenFromEmail } from "./getAccessTokenFromEmail";
import { getPrimaryCalendar } from "./getPrimaryCalendar";
import { getCalendarEvents } from "./getCalendarEvents";
import { calendar_v3 } from "googleapis";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const { date, time, duration, description, location, invitees, email } =
      req.body;
    const timeZone = "America/Los_Angeles";
    if (!date) {
      context.res = {
        status: 400,
        body: "Missing 'date' field in the request body.",
      };
      return;
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      context.res = {
        status: 400,
        body: "Invalid date format. Please provide a valid date.",
      };
      return;
    }

    const parsedDuration = duration ? parseInt(duration) : 30; // Default duration is 30 minutes

    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      context.res = {
        status: 400,
        body: "Invalid duration format. Please provide a valid positive integer duration in minutes.",
      };
      return;
    }

    // Define the start and end time for the day
    const startTime = new Date(parsedDate);
    startTime.setHours(0, 0, 0, 0);
    const endTime = new Date(parsedDate);
    endTime.setHours(23, 59, 59, 999);

    // Obtain the access token
    const accessToken = await getAccessToken(req);

    // const calendarId = await getPrimaryCalendar(accessToken); // this is the same as the user email

    const events = await getCalendarEvents(
      accessToken,
      email,
      startTime,
      endTime
    );

    if (events.length === 0) {
      // No events for the given date, consider the whole day as an empty time slot
      const emptySlot = {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
      };

      // Set the meeting on the empty slot
      await setMeeting(
        emptySlot,
        parsedDuration,
        accessToken,
        timeZone,
        time,
        description,
        location,
        invitees
      );
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
        parsedDuration,
        accessToken,
        timeZone,
        time,
        description,
        location,
        invitees
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
  const { email } = req.body;

  if (!email) {
    throw new Error("Email is required.");
  }

  return getAccessTokenFromEmail(email);
}

async function setMeeting(
  timeSlot: { start: string; end: string },
  duration: number,
  accessToken: string,
  timeZone: string,
  time?: string,
  description?: string,
  location?: string,
  invitees?: string[]
) {
  const meetingStart = time ? new Date(time) : new Date(timeSlot.start);
  const meetingEnd = new Date(meetingStart.getTime() + duration * 60 * 1000); // Meeting duration in minutes

  // Logic to set the meeting using the obtained start and end times
  // (e.g., make a request to Google Calendar API to create a new event)
  // Replace with your own implementation

  // Example using Axios:
  const response = await axios.post<calendar_v3.Schema$Event>(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
    {
      start: {
        dateTime: meetingStart.toISOString(),
        timeZone,
      },
      end: {
        dateTime: meetingEnd.toISOString(),
        timeZone,
      },
      description: description || "",
      location: location || "",
      attendees: invitees ? invitees.map((email) => ({ email })) : undefined,
      // Other event details
      // ...
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
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
