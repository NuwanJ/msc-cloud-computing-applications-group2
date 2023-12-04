import { SampleHandler } from "./handlers/SampleHandler";
import { EnvironmentProvider } from "./lib/EnvironmentProvider";

const environmentProvider = new EnvironmentProvider();

const handler = new SampleHandler(environmentProvider).getHandler();

export default handler;
