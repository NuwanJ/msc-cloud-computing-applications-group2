import { ReminderHandler } from "./handlers/ReminderHandler";
import { DynamoDBServiceProvider } from "./lib/DatabaseProvider";
import { EnvironmentProvider } from "./lib/EnvironmentProvider";

const environmentProvider = new EnvironmentProvider();
const dynamodbProvider = new DynamoDBServiceProvider(
  environmentProvider.getValue("AppointmentsTable")
);

const handler = new ReminderHandler(
  environmentProvider,
  dynamodbProvider
).getHandler();

export default handler;
