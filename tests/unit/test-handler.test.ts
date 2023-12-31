import { SampleHandler } from "../../src/handlers/SampleHandler";
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

  handler = new SampleHandler(
    EnvironmentProviderMock(),
    SessionProviderMock(),
    DatabaseProviderMock()
  );
});

describe("Unit test for app handler", function () {
  it("Verifies successful response", async () => {
    const result = await handler.sampleFunction();

    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual({
      Sample: "This is a sample function",
      session: {
        sub: "string",
        email: "user@example.com",
      },
    });
  });

  it("Test custom events ", async () => {
    // Set custom event parameters for testing
    handler.setEvent({
      ...handler.event,
      pathParameters: { id: "1234" },
      queryStringParameters: { q: "abcd" },
      requestContext: {
        ...handler.event?.requestContext,
        httpMethod: RequestType.GET,
      },
    });

    const result = await handler.handle();

    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual({
      message: "This is a sample message for a GET request",
      request: {
        path: { id: "1234" },
        query: { q: "abcd" },
      },
      session: {
        sub: "string",
        email: "user@example.com",
      },
    });
  });
});
