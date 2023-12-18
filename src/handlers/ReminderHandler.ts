import { IEnvironmentProvider } from "../lib/EnvironmentProvider";
import { ScheduledEventHandler } from "../lib/ScheduledEventHandler";

export class ReminderHandler extends ScheduledEventHandler {
  async handle(): Promise<void> {
    console.log("Scheduler Event Occurred !");

    // TODO: implement any action here
  }

  constructor(public environmentProvider: IEnvironmentProvider) {
    super(environmentProvider);
  }
}
