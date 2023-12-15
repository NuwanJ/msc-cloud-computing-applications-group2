// import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SampleHandler } from "../../src/handlers/SampleHandler";
import { APIGatewayEventHandler } from "../../src/lib/APIGatewayEventHandler";
import { EventResult } from "../../src/lib/EventHandler";
import { RequestType } from "../../types/APIGatewayTypes";
// import { IEnvironmentProvider } from "../../src/lib/EnvironmentProvider";

let EnvironmentProviderMock: jest.Mock;
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

  handler = new SampleHandler(EnvironmentProviderMock());
});

describe("Unit test for app handler", function () {
  it("Verifies successful response", async () => {
    const result = await handler.sampleFunction();

    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual({ Sample: "This is a sample function" });
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
    });
  });
});
