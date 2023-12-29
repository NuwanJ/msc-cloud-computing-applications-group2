import { ReminderHandler } from "./handlers/ReminderHandler";
import { DynamoDBServiceProvider } from "./lib/DatabaseProvider";
import { EnvironmentProvider } from "./lib/EnvironmentProvider";
import { SQSServiceProvider } from "./lib/SQSQueueProvider";

const environmentProvider = new EnvironmentProvider();
const dynamodbProvider = new DynamoDBServiceProvider(
  environmentProvider.getValue("AppointmentTableName")
);
const emailSender = new SQSServiceProvider(
  environmentProvider.getValue("QueueUrl")
);

const handler = new ReminderHandler(
  environmentProvider,
  dynamodbProvider,
  emailSender
).getHandler();

export default handler;
