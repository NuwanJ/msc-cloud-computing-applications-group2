import { SampleHandler } from "./handlers/SampleHandler";
import { DynamoDBServiceProvider } from "./lib/DatabaseProvider";
import { EnvironmentProvider } from "./lib/EnvironmentProvider";

const environmentProvider = new EnvironmentProvider();
const dynamodbProvider = new DynamoDBServiceProvider(
  environmentProvider.getValue("SampleTableName")
);
const handler = new SampleHandler(
  environmentProvider,
  dynamodbProvider
).getHandler();

export default handler;
