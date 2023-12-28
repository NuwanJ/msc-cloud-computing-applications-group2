import { AppointmentHandler } from "./handlers/AppointmentHandler";
import { EnvironmentProvider } from "./lib/EnvironmentProvider";
import { DynamoDBServiceProvider } from "./lib/DatabaseProvider";
import { SessionProvider } from "./lib/SessionProvider";

const environmentProvider = new EnvironmentProvider();
const sessionProvider = new SessionProvider(environmentProvider);
const dynamodbProvider = new DynamoDBServiceProvider(
  environmentProvider.getValue("AppointmentTableName")
);

const handler = new AppointmentHandler(
  environmentProvider,
  sessionProvider,
  dynamodbProvider
).getHandler();

export default handler;
