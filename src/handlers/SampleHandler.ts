import { IEventResult, RequestType } from "../../types/APIGatewayTypes";
import { APIGatewayEventHandler } from "../lib/APIGatewayEventHandler";
import { IEnvironmentProvider } from "../lib/EnvironmentProvider";
import { EventResult } from "../lib/EventHandler";
export class SampleHandler extends APIGatewayEventHandler {
  // Path formats:
  // - /sample
  // - /sample/{action}
  async handle(): Promise<IEventResult> {
    if (this.event.requestContext.httpMethod === RequestType.GET) {
      return new EventResult(
        {
          message: "This is a sample message for a GET request",
          request: {
            query: this.getQueryStringParameters(),
            path: this.getPathParameters(),
          },
        },
        200
      );
    } else if (this.event.requestContext.httpMethod === RequestType.POST) {
      return new EventResult(
        {
          message: "This is a sample message for a POST request",
          request: {
            query: this.getQueryStringParameters(),
            path: this.getPathParameters(),
            body: this.getBody(),
          },
        },
        200
      );
    } else {
      return this.sampleFunction();
    }

    // return new EventResult(null, 404);
  }

  async sampleFunction(): Promise<IEventResult> {
    return new EventResult({ Sample: "This is a sample function" }, 200);
  }

  constructor(public environmentProvider: IEnvironmentProvider) {
    super(environmentProvider);
  }
}
