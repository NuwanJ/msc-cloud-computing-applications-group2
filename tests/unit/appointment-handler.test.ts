import { AppointmentHandler } from "../../src/handlers/AppointmentHandler";
import { RequestType } from "../../types/APIGatewayTypes";

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
  DatabaseProviderMock = jest.fn();

  handler = new AppointmentHandler(
    EnvironmentProviderMock(),
    SessionProviderMock(),
    DatabaseProviderMock()
  );

  handler.setEvent({
    ...handler.event,
    pathParameters: { id: "1234" },
    queryStringParameters: { q: "abcd" },
    requestContext: {
      ...handler.event?.requestContext,
      httpMethod: RequestType.GET,
    },
  });
});

describe("Unit test title", function () {
  it("Unit test name", async () => {
    const result = await handler.handle();

    // TODO set events and write test cases
    expect(result.statusCode).toEqual(404);
  });
});
