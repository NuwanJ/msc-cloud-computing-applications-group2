import moment from "moment-timezone";
import { AppointmentHandler } from "../../src/handlers/AppointmentHandler";
import { RequestType } from "../../types/APIGatewayTypes";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

let EnvironmentProviderMock: jest.Mock;
let SessionProviderMock: jest.Mock;
let DatabaseProviderMock: jest.Mock;
let handler;

beforeAll(() => {
  EnvironmentProviderMock = jest.fn(() => ({
    env: {
      SecretKey: "SecretKey",
    },
    getValue(key): string {
      return key;
    },
    getEnvObject(): Record<string, string> {
      return this.env;
    },
  }));

  SessionProviderMock = jest.fn(() => ({
    decodeToken(): unknown {
      return {
        sub: "string",
        email: "user@example.com",
      };
    },
    getUserName(): string {
      return "user@example.com";
    },
    getUserId(): string {
      return "user@example.com";
    },
  }));
  DatabaseProviderMock = jest.fn(() => ({
    putItem(item: object): unknown {
      return { item };
    },
  }));

  handler = new AppointmentHandler(
    EnvironmentProviderMock(),
    SessionProviderMock(),
    DatabaseProviderMock()
  );

  handler.setEvent({
    ...handler.event,
    requestContext: {
      ...handler.event?.requestContext,
      httpMethod: RequestType.GET,
    },
  });
});

it("Unit test name", async () => {
  const result = await handler.handle();

  // TODO set events and write test cases
  expect(result.statusCode).toEqual(404);
});

it("should correctly validate create appointment request", async () => {
  let result;

  //  Missing post parameters
  handler.event = { ...handler.event };
  result = await handler.handle();
  expect(result.statusCode).toEqual(404);

  // Success with correct body parameters
  handler.setEvent({
    ...handler.event,
    requestContext: {
      ...handler.event?.requestContext,
      httpMethod: RequestType.PUT,
    },
    pathParameters: { action: "create" },
    body: JSON.stringify({
      doctorName: "ABC",
      startTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      endTime: moment().add(15, "minutes").format("YYYY-MM-DD HH:mm:ss"),
    }),
  });
  result = await handler.handle();
  console.log(handler.event, result);
  expect(result.statusCode).toEqual(201);
});
