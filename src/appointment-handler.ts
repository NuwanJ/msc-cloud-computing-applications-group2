import { AppointmentHandler } from "./handlers/AppointmentHandler";
import { EnvironmentProvider } from "./lib/EnvironmentProvider";

const environmentProvider = new EnvironmentProvider();

const handler = new AppointmentHandler(environmentProvider).getHandler();

export default handler;