import { SampleHandler } from "../../src/handlers/SampleHandler";
// import { IDatabaseProvider } from "../../src/lib/providers/DatabaseProvider";
// import type { ISessionProvider } from "../../src/lib/providers/SessionProvider";
import { RequestType } from "../../types/APIGatewayTypes";
import { TokenPayload } from "../../types/SessionProviderTypes";
// import { TokenPayload } from "../../types/SessionProviderTypes";

let EnvironmentProviderMock: jest.Mock;
let SessionProviderMock: jest.Mock; // <ISessionProvider>;
let DatabaseProviderMock: jest.Mock; //<IDatabaseProvider>;
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

    console.log(result.body);
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
