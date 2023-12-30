//f652cbd4-Singlife-SABER
import { format } from "util";
import { EventHandler } from "./EventHandler";
import type { ScheduledEvent, ScheduledHandler } from "aws-lambda";
import { Level } from "../../../types/APIGatewayTypes";

export interface IScheduledEventHandler {
  setEvent(event: ScheduledEvent): void;
  getHandler(): ScheduledHandler;
  handle(event: ScheduledEvent): Promise<void>;
}

export abstract class ScheduledEventHandler
  extends EventHandler
  implements IScheduledEventHandler
{
  event: ScheduledEvent;

  async handle(): Promise<void> {
    throw new Error("Empty Handler");
  }

  setEvent(event: ScheduledEvent): void {
    this.event = event;
  }

  getHandler(): ScheduledHandler {
    return async (event: ScheduledEvent): Promise<void> => {
      console.log({
        level: Level.Debug,
        message: "Scheduler Request",
        context: event,
      });

      this.setEvent(event);

      try {
        await this.handle();
      } catch (e) {
        await this.reportError(e);
        console.log({
          level: Level.Debug,
          message: "Stack Trace",
          context: format(e),
        });
      }
    };
  }
}
