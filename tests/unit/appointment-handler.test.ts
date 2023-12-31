import { AppointmentHandler } from "../../src/handlers/AppointmentHandler";
import { EnvironmentProvider } from "../../src/lib/providers/EnvironmentProvider";
import { DynamoDBServiceProvider } from "../../src/lib/providers/DatabaseProvider";
import { SessionProvider } from "../../src/lib/providers/SessionProvider";

jest.mock("../../src/lib/providers/EnvironmentProvider");
jest.mock("../../src/lib/providers/DatabaseProvider");
jest.mock("../../src/lib/providers/SessionProvider");

describe("AppointmentHandler", () => {
  let environmentProvider;
  let sessionProvider;
  let dynamodbProvider;
  let appointmentHandler;

  beforeEach(() => {
    environmentProvider = new EnvironmentProvider();
    environmentProvider.getValue = jest.fn((key) => {
      if (key === "AppointmentTableName") return "mockTableName";
    });

    sessionProvider = new SessionProvider(environmentProvider);
    dynamodbProvider = new DynamoDBServiceProvider(
      environmentProvider.getValue("AppointmentTableName")
    );

    appointmentHandler = new AppointmentHandler(
      environmentProvider,
      sessionProvider,
      dynamodbProvider
    );
  });

  it("should create an instance of AppointmentHandler correctly", () => {
    expect(appointmentHandler).toBeDefined();
    expect(environmentProvider).toBeInstanceOf(EnvironmentProvider);
    expect(sessionProvider).toBeInstanceOf(SessionProvider);
    expect(dynamodbProvider).toBeInstanceOf(DynamoDBServiceProvider);
  });

  it("should return a handler function from getHandler", () => {
    const handler = appointmentHandler.getHandler();
    expect(typeof handler).toBe("function");
  });
});
