import { SampleHandler } from "./handlers/SampleHandler";
import { DynamoDBServiceProvider } from "./lib/DatabaseProvider";
import { EnvironmentProvider } from "./lib/EnvironmentProvider";
import { SessionProvider } from "./lib/SessionProvider";

const environmentProvider = new EnvironmentProvider();
const sessionProvider = new SessionProvider(environmentProvider);
const dynamodbProvider = new DynamoDBServiceProvider(
  environmentProvider.getValue("SampleTableName")
);
const handler = new SampleHandler(
  environmentProvider,
  sessionProvider,
  dynamodbProvider
).getHandler();

export default handler;
