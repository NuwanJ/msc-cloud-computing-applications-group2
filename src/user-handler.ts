import { UserHandler } from "./handlers/UserHandler";
import { EnvironmentProvider } from "./lib/EnvironmentProvider";

const environmentProvider = new EnvironmentProvider();

const handler = new UserHandler(environmentProvider).getHandler();

export default handler;
