import { ReminderHandler } from "./handlers/ReminderHandler";
import { EnvironmentProvider } from "./lib/EnvironmentProvider";

const environmentProvider = new EnvironmentProvider();

const handler = new ReminderHandler(environmentProvider).getHandler();

export default handler;
