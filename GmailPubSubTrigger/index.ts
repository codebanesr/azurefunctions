import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { gmail_v1 } from "googleapis";
import { decode } from "js-base64";
import mongoose from "mongoose";
import { categorizeEmailAi } from "./categorizeEmail";
import { EmailModel } from "./email.model";
import { getGmailMessages } from "./getGmailMessage";
import { UserModel } from "./user.model";
import { getAccessTokenFromRefreshToken } from "./get-access-from-refresh-token";

const connectionString = process.env.MONGO_URI;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    // Connect to MongoDB
    await mongoose.connect(connectionString, {});
    console.log({ message: "Connected to mongodb" });

    // Extract email data from the request body
    const { message, subscription } = req.body as EmailWebhookPushPayload;
    const decodedData = Buffer.from(message.data, "base64").toString("utf-8");

    const { emailAddress, historyId } = JSON.parse(decodedData);

    // Retrieve access token from UserModel (replace with your actual UserModel code)
    const user = await UserModel.findOne({ email: emailAddress }).lean().exec();
    const { refreshToken } = user;
    let { accessToken } = user;

    accessToken =
      (await getAccessTokenFromRefreshToken({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        refreshToken,
      })) || accessToken;

    // Fetch email content using users.messages.get
    const emailData = await getGmailMessages(accessToken, "me", historyId);

    const category = await categorizeEmail(emailData, context); // Function to categorize the email

    if (!category) {
      context.res = {
        status: 200,
        body: "This email lacks text body, it was not processed",
      };
    }
    // Store the email data in the database
    const newEmail = new EmailModel({
      email: emailAddress,
      messageId: message.messageId || message.message_id,
      publishTime: message.publishTime || message.publish_time,
      message,
      category,
    });

    await newEmail.save();
    context.res = {
      status: 200,
      body: "Email categorized and stored successfully.",
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: "Error processing the email: " + error.message,
    };
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
  }
};

// Function to categorize the email (modify this logic as per your categorization requirements)
async function categorizeEmail(
  emailData: gmail_v1.Schema$Message,
  context: Context
) {
  const { body, parts, mimeType } = emailData.payload || {};
  let data = "";

  if (mimeType === "text/html") {
    context.res = {
      status: 200,
      body: "Cannot parse html content right now!",
    };

    return;
  }

  const logError = (message: string) => {
    context.log.error(message);
    // You can customize the error handling logic here
  };

  const mimeHandlers = {
    "text/plain": (part: any) => {
      try {
        return decode(part.body.data);
      } catch (error) {
        logError("Error decoding text/plain part");
        return "";
      }
    },
    "text/html": (part: any) => {
      try {
        // will handle it later
        return "";
        // return decode(part.body.data);
      } catch (error) {
        logError("Error decoding text/html part");
        return "";
      }
    },
    "application/octet-stream": (part: any) => {
      return decode(part.body.data.toString());
    },
  };

  const processBody = (emailBody: any) => {
    if (emailBody?.size > 0) {
      try {
        return decode(emailBody.data);
      } catch (error) {
        logError("Error decoding email body");
        return "";
      }
    }
    return "";
  };

  const processPart = (part: any) => {
    const handler = mimeHandlers[part.mimeType];
    if (handler) {
      return handler(part);
    } else {
      // Handle other mime types if necessary
      return "";
    }
  };

  if (body.size > 0) {
    data = processBody(body);
  } else if (parts?.length > 0) {
    for (const part of parts) {
      data += processPart(part);
    }
  } else {
    // Handle the case when both body and parts are missing or empty
  }

  console.log({ data: JSON.stringify(data, null, 2) });

  if (!data) {
    return;
  }
  const category = await categorizeEmailAi(data);
  return category;
}

export default httpTrigger;
