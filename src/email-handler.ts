import { EmailQueueProcessor } from "./queues/EmailQueueProcessor";
import { EnvironmentProvider } from "./lib/providers/EnvironmentProvider";
const environmentProvider = new EnvironmentProvider();

const handler = new EmailQueueProcessor(environmentProvider).getHandler();

export default handler;
