import { AppointmentHandler } from "./handlers/AppointmentHandler";
import { EnvironmentProvider } from "./lib/EnvironmentProvider";
import { DynamoDBServiceProvider } from "./lib/DatabaseProvider";

const environmentProvider = new EnvironmentProvider();
const dynamodbProvider = new DynamoDBServiceProvider(
    environmentProvider.getValue("AppointmentTableName")
);

const handler = new AppointmentHandler(
    environmentProvider,
    dynamodbProvider
).getHandler();

export default handler;