import { ReminderHandler } from "../../src/handlers/ReminderHandler";
import { DynamoDBServiceProvider } from "../../src/lib/providers/DatabaseProvider";
import { EnvironmentProvider } from "../../src/lib/providers/EnvironmentProvider";
import { SQSServiceProvider } from "../../src/lib/providers/SQSQueueProvider";

jest.mock("../../src/lib/providers/DatabaseProvider");
jest.mock("../../src/lib/providers/EnvironmentProvider");
jest.mock("../../src/lib/providers/SQSQueueProvider");

describe("ReminderHandler", () => {
  let environmentProvider;
  let dynamodbProvider;
  let sqsServiceProvider;
  let reminderHandler;

  beforeEach(() => {
    environmentProvider = new EnvironmentProvider();
    environmentProvider.getValue = jest.fn((key) => {
      if (key === "AppointmentTableName") return "mockTableName";
      if (key === "QueueUrl") return "mockQueueUrl";
    });

    dynamodbProvider = new DynamoDBServiceProvider(
      environmentProvider.getValue("AppointmentTableName")
    );
    sqsServiceProvider = new SQSServiceProvider(
      environmentProvider.getValue("QueueUrl")
    );

    reminderHandler = new ReminderHandler(
      environmentProvider,
      dynamodbProvider,
      sqsServiceProvider
    );
  });

  it("should create an instance of ReminderHandler correctly", () => {
    expect(reminderHandler).toBeDefined();
    expect(dynamodbProvider).toBeInstanceOf(DynamoDBServiceProvider);
    expect(sqsServiceProvider).toBeInstanceOf(SQSServiceProvider);
  });

  it("should return a handler function from getHandler", () => {
    const handler = reminderHandler.getHandler();
    expect(typeof handler).toBe("function");
  });
});
