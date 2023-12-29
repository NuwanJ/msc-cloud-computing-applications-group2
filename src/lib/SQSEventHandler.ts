import { Level } from "../../types/APIGatewayTypes";
import { EventHandler } from "./EventHandler";
import type { SQSEvent, SQSHandler, SQSRecord } from "aws-lambda";

export interface ISQSEventHandler {
  setEvent(event: SQSEvent): void;
  getHandler(): SQSHandler;
  getRecords(): Array<SQSRecord>;
  handle(): Promise<void>;
}

export abstract class SQSEventHandler
  extends EventHandler
  implements ISQSEventHandler
{
  event: SQSEvent;

  async handle(): Promise<void> {
    throw new Error("Handler not implemented");
  }

  getRecords(): Array<SQSRecord> {
    if (!this.event) {
      throw new Error("Event is undefined");
    }

    return this.event.Records;
  }

  setEvent(event: SQSEvent): void {
    this.event = event;
  }

  getHandler(): SQSHandler {
    return async (event: SQSEvent): Promise<void> => {
      try {
        console.log({
          level: Level.Debug,
          message: "SQS event",
          context: event,
        });
        this.setEvent(event);
        await this.handle();
      } catch (e) {
        await this.reportError(e);
        console.log({
          level: Level.Debug,
          message: "stack trace",
          context: e,
        });
      }
    };
  }
}
