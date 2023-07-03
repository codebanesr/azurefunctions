**Azure Function to Schedule a Meeting using Google Calendar API (with OAuth 2.0)**

You are tasked with implementing an Azure Function that interacts with the Google Calendar API to schedule a meeting on behalf of a user. The Azure Function should have an HTTP trigger and accept the following parameters:

- `email` (required): The email address of the user on whose behalf the meeting should be scheduled. It should be provided as a query parameter.
- `date` (required): The date for which the meeting should be scheduled. It should be provided as a query parameter in the format "YYYY-MM-DD".
- `time` (optional): The time for the meeting. It should be provided as a query parameter in the format "HH:MM" (24-hour format).
- `duration` (optional): The duration of the meeting in minutes. It should be provided as a query parameter.

The Azure Function should perform the following steps:

1. Validate the input parameters:
   - Ensure that the `email` and `date` parameters are provided.
   - Validate the format of the `date` parameter.
   - Validate the format and value of the `duration` parameter (if provided).

2. Check if the user is authenticated:
   - If the user is not authenticated, redirect the user to the OAuth 2.0 authorization endpoint to obtain an authorization code.

3. Retrieve an access token:
   - Exchange the authorization code for an access token using the OAuth 2.0 token endpoint.

4. Retrieve the events for the specified date from the user's Google Calendar:
   - Use the obtained access token to fetch the events for the specified date.
   - Handle any errors that may occur during the API request.

5. Find available time slots:
   - Determine the available time slots for the specified date based on the retrieved events.
   - If no events exist for the specified date, consider the whole day as an empty time slot.
   - If there are no available time slots, return an appropriate response.

6. Set the meeting:
   - If an empty time slot is found, set the meeting on that slot.
   - If a specific time is provided via the `time` parameter, use that time for the meeting.
   - Use the specified or default duration for the meeting.
   - Handle any errors that may occur while setting the meeting.

7. Return a response:
   - Return a success message if the meeting is successfully scheduled.
   - Return an appropriate error message if any errors occur during the process.

Please write an Azure Function code in Node.js that fulfills the requirements mentioned above. Handle all possible edge cases and errors.

Once you have implemented the Azure Function, you can test it using the following cURL command:

```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "date": "2023-07-04",
  "time": "09:00:00",
  "duration": "60",
  "description": "Team Meeting",
  "location": "Conference Room",
  "invitees": ["john@example.com", "jane@example.com"]
}' https://<your-azure-function-url>
```

Replace `<YOUR_AZURE_FUNCTION_URL>` with the actual URL of your Azure Function. Adjust the `email`, `date`, `time`, and `duration` parameters as needed for your testing.

Please note that you need to replace `<YOUR_AZURE_FUNCTION_URL>` with the actual URL of your deployed Azure Function.

Let me know if you need any further assistance!