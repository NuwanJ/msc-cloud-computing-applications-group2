import { EmailSenderQueue } from "./handlers/EmailSender";
import { EnvironmentProvider } from "./lib/EnvironmentProvider";
const environmentProvider = new EnvironmentProvider();

const handler = new EmailSenderQueue(environmentProvider).getHandler();

export default handler;
