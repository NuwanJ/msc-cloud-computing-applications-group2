import { EmailSenderQueue } from "./handlers/EmailSender";
import { EnvironmentProvider } from "./lib/providers/EnvironmentProvider";
const environmentProvider = new EnvironmentProvider();

const handler = new EmailSenderQueue(environmentProvider).getHandler();

export default handler;
