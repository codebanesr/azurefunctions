import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { gmail_v1 } from "googleapis";
import { decode } from "js-base64";
import mongoose from "mongoose";
import { categorizeEmailAi } from "./categorizeEmail";
import { EmailModel } from "./email.model";
import { getGmailMessages } from "./getGmailMessage";
import { UserModel } from "./user.model";

const connectionString = process.env.MONGO_URI;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    // Connect to MongoDB
    await mongoose.connect(connectionString, {});

    // Extract email data from the request body
    const { message } = req.body;
    const decodedData = Buffer.from(message.data, "base64").toString("utf-8");
    const { email, messageId, publishTime } = JSON.parse(decodedData);

    // Retrieve access token from UserModel (replace with your actual UserModel code)
    const user = await UserModel.findOne({ email });
    const { accessToken } = user;

    // Fetch email content using users.messages.get
    const emailData = await getGmailMessages(accessToken, "me", messageId);

    const category = await categorizeEmail(emailData); // Function to categorize the email

    // Store the email data in the database
    const newEmail = new EmailModel({
      email,
      messageId,
      publishTime,
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
async function categorizeEmail(emailData: gmail_v1.Schema$Message) {
  const category = await categorizeEmailAi(decode(emailData.payload.body.data));
  return category;
}

export default httpTrigger;
