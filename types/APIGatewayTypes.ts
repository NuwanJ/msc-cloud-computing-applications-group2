import type { APIGatewayProxyResult } from "aws-lambda";

export type HTTPClientError = {
  message: string;
  statusCode: number;
  errorCode?: number;
  errorMessage?: string;
  passErrorToApp?: boolean;
};

export interface IEventResult {
  result(): APIGatewayProxyResult;
}

export enum Level {
  Info = "INFO",
  Debug = "DEBUG",
  Warning = "WARNING",
  Error = "ERROR",
}

export enum RequestType {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}
