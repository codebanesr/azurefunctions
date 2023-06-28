interface MessageData {
  email: string;
  historyId: number;
}

interface Message {
  data: string;
  messageId: string;
  message_id: string;
  publishTime: string;
  publish_time: string;
}

interface Subscription {
  subscription: string;
}

interface EmailWebhookPushPayload {
  message: Message;
  subscription: string;
}