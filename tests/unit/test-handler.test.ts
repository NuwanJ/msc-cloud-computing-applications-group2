import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SampleHandler } from "../../src/handlers/SampleHandler";
import { IEnvironmentProvider } from "../../src/lib/EnvironmentProvider";

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
  it("verifies successful response", async () => {
    const result = await handler.sampleFunction();
    const resp = result.result();

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({});
  });
});
