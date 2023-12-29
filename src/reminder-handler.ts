import { ReminderHandler } from "./handlers/ReminderHandler";
import { DynamoDBServiceProvider } from "./lib/providers/DatabaseProvider";
import { EnvironmentProvider } from "./lib/providers/EnvironmentProvider";
import { SQSServiceProvider } from "./lib/providers/SQSQueueProvider";

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
