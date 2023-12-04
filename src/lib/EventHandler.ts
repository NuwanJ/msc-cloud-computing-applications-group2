import type { APIGatewayProxyResult } from "aws-lambda";
import { HTTPClientError, IEventResult } from "../../types/APIGatewayTypes";
import { IEnvironmentProvider } from "./EnvironmentProvider";

export class EventResult implements IEventResult {
  result(): APIGatewayProxyResult {
    return {
      statusCode: this.statusCode,
      headers: this.getResponseHeaders(),
      multiValueHeaders: {},
      body: this.getResponseBody(),
      isBase64Encoded: this.isBase64Encoded,
    };
  }

  protected getResponseHeaders(): Record<string, string> {
    // TODO: Define response headers if there should any
    return Object.assign(this.headers, {});
  }

  protected getResponseBody(): string {
    return this.isBase64Encoded
      ? this.body.toString()
      : JSON.stringify(this.body);
  }

  constructor(
    public body: object | string,
    public statusCode = 200,
    public headers: Record<string, string> = {},
    public isBase64Encoded: boolean = false
  ) {}
}

export interface IEventHandler {
  handle(): Promise<IEventResult>;
}

export abstract class EventHandler {
  async reportError(e: HTTPClientError): Promise<void> {
    const allowedStatusCodes = [200, 422, 403];

    if (allowedStatusCodes.indexOf(e.statusCode) <= 0) {
      // TODO: Use Error reporting service
    }
  }

  constructor(public environmentProvider: IEnvironmentProvider) {
    // Nothing for now
  }
}
