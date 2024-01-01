import { AppointmentHandler } from "./handlers/AppointmentHandler";
import { EnvironmentProvider } from "./lib/providers/EnvironmentProvider";
import { DynamoDBServiceProvider } from "./lib/providers/DatabaseProvider";
import { SessionProvider } from "./lib/providers/SessionProvider";

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
