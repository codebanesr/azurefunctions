import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import mongoose from "mongoose";
import { categorizeEmail } from "./categorizeEmail";
import { EmailModel } from "./email.model";
import { getAccessTokenFromRefreshToken } from "../utils/get-access-from-refresh-token";
import { getGmailMessages } from "./getGmailMessage";
import { UserModel } from "../utils/user.model";


const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {});
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

    const { category, data } = await categorizeEmail(emailData, context); // Function to categorize the email

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
      emailBody: data,
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

export default httpTrigger;
