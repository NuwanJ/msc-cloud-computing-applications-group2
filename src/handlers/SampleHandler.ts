import { IEventResult } from "../../types/APIGatewayTypes";
import { APIGatewayEventHandler } from "../lib/APIGatewayEventHandler";
import { IEnvironmentProvider } from "../lib/EnvironmentProvider";
import { EventResult } from "../lib/EventHandler";

export class SampleHandler extends APIGatewayEventHandler {
  async handle(): Promise<IEventResult> {
    if (
      this.event.requestContext.httpMethod === "GET" &&
      this.getPathParam("action") == "action"
    ) {
      return new EventResult(
        {
          message: "This is a sample message",
          event: {
            headers: this.getHeaders(),
            query: this.getQueryStringParameters(),
            path: this.getPathParameters(),
          },
        },
        200
      );
    }

    return new EventResult(null, 404);
  }

  constructor(public environmentProvider: IEnvironmentProvider) {
    super(environmentProvider);
  }
}
