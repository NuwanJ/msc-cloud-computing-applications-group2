import { UserHandler } from "./handlers/UserHandler";
import { EnvironmentProvider } from "./lib/EnvironmentProvider";
import { SessionProvider } from "./lib/SessionProvider";

const environmentProvider = new EnvironmentProvider();
const sessionProvider = new SessionProvider(environmentProvider);

const handler = new UserHandler(
  environmentProvider,
  sessionProvider
).getHandler();

export default handler;
