import type {
  APIGatewayEvent,
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import {
  IEventResult,
  HTTPClientError,
  Level,
  RequestType,
} from "../../../types/APIGatewayTypes";
import { EventHandler, EventResult } from "./EventHandler";
import { IEnvironmentProvider } from "../providers/EnvironmentProvider";
import { ISessionProvider } from "../providers/SessionProvider";

export interface IAPIGatewayEventHandler {
  getHandler(): APIGatewayProxyHandler;
  getBody<T extends Record<string, unknown>>(): T;
  getBodyRaw(): string;
  getHeader(key: string): string;
  getHeaders(): Record<string, string>;
  handle(event: APIGatewayProxyEvent): Promise<IEventResult>;
  getPath(): string;
  getMethod(): RequestType;
  getPathParam(paramName: string): string;
  getPathParameters(): Record<string, string>;
  getToken(): string;
  getQueryParam(paramName: string): string;
  getQueryStringParameters(): Record<string, string>;
  getMultiValueQueryStringParameters(): Record<string, string[]>;
  setSessionToken(): void;
  errorResponse(e: HTTPClientError): APIGatewayProxyResult;
  setEvent(event: APIGatewayEvent);
}

export abstract class APIGatewayEventHandler
  extends EventHandler
  implements IAPIGatewayEventHandler
{
  event: APIGatewayProxyEvent;
  eventBody: object | null = null;

  async handle(): Promise<IEventResult> {
    return new EventResult(
      {
        message: "Empty Handler",
      },
      501
    );
  }

  getBody<T extends Record<string, unknown>>(): T {
    if (!this.event) {
      throw new Error("Event is Undefined");
    }

    if (this.eventBody == null) return <T>this.setBody();
    return <T>this.eventBody;
  }

  getBodyRaw(): string {
    return this.event.body;
  }

  getHeader(key: string): string {
    return this.event.headers ? this.event.headers[key] : undefined;
  }

  getHeaders(): Record<string, string> {
    if (!this.event) {
      throw new Error("Event is undefined");
    }
    return this.event.headers;
  }

  getPath(): string {
    return this.event.path;
  }

  getPathParam(paramName: string): string {
    return this.getPathParameters() && this.getPathParameters()[paramName]
      ? this.getPathParameters()[paramName]
      : null;
  }

  getPathParameters(): Record<string, string> {
    if (!this.event) {
      throw new Error("Event is undefined");
    }
    return this.event.pathParameters;
  }

  getQueryParam(paramName: string): string {
    return this.getQueryStringParameters() &&
      this.getQueryStringParameters()[paramName]
      ? this.getQueryStringParameters()[paramName]
      : null;
  }

  getToken(): string {
    return this.event.headers.Authorization
      ? this.event.headers.Authorization?.split(" ")[1]
      : null;
  }

  getQueryStringParameters(): Record<string, string> {
    if (!this.event) {
      throw new Error("Event is undefined");
    }

    return this.event.queryStringParameters;
  }

  getMultiValueQueryStringParameters(): Record<string, string[]> {
    if (!this.event) {
      throw new Error("Event is undefined");
    }

    return this.event.multiValueQueryStringParameters;
  }

  getMethod(): RequestType {
    return <RequestType>this.event.requestContext.httpMethod;
  }

  setBody(): object {
    if (this.event?.body) {
      try {
        this.eventBody = JSON.parse(this.event.body);
      } catch (exception) {
        console.log({
          level: Level.Debug,
          message:
            "Failed to canonicalize request body; using raw request body",
          context: exception,
        });
        this.eventBody = { body: this.event?.body };
      }
    }
    return this.eventBody;
  }

  setEvent(event: APIGatewayProxyEvent): void {
    this.event = event;
    this.setBody();
  }

  setSessionToken(): void {
    if (this.sessionProvider) {
      this.sessionProvider.setToken(this.getToken());
    } else {
      console.error("setSessionToken: Session not found");
    }
  }

  getHandler(): APIGatewayProxyHandler {
    return async (
      event: APIGatewayProxyEvent
    ): Promise<APIGatewayProxyResult> => {
      this.setEvent(event);
      this.setSessionToken();

      try {
        console.log({
          level: Level.Debug,
          message: "Lambda Request",
          context: { ...event, body: this.getBody() },
        });

        const result: IEventResult = await this.handle();
        const lambdaResponse: APIGatewayProxyResult = result.result();

        let parseResponseBody: object;

        try {
          parseResponseBody = JSON.parse(lambdaResponse.body);

          console.log({
            level: Level.Debug,
            message: "Lambda Response",
            context: { ...lambdaResponse, body: parseResponseBody },
          });
        } catch (exception) {
          console.log({
            level: Level.Debug,
            message: "Failed to parse response body; using raw response body",
            context: exception,
          });

          console.log({
            level: Level.Debug,
            message: "Lambda Response",
            context: lambdaResponse,
          });
        }
        return lambdaResponse;
      } catch (e) {
        //
        await this.reportError(e);

        console.log({
          level: Level.Debug,
          message: "Stack Trace",
          context: e,
        });

        if (e.statusCode == 422 || e.statusCode == 400) {
          return this.errorResponse(e);
        }
      }
    };
  }

  errorResponse(e: HTTPClientError): APIGatewayProxyResult {
    return {
      statusCode: e.statusCode ? e.statusCode : 500,
      body: JSON.stringify({
        error: JSON.parse(JSON.stringify(e, Object.getOwnPropertyNames(e))),
      }),
    };
  }

  constructor(
    public environmentProvider: IEnvironmentProvider,
    public sessionProvider?: ISessionProvider
  ) {
    super(environmentProvider);
  }
}
