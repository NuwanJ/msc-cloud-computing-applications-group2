import { EmailQueueProcessor } from "../../src/queues/EmailQueueProcessor";
import { EnvironmentProvider } from "../../src/lib/providers/EnvironmentProvider";

jest.mock("../../src/lib/providers/EnvironmentProvider");

describe("EmailQueueProcessor", () => {
  let environmentProvider;
  let emailQueueProcessor;

  beforeEach(() => {
    environmentProvider = new EnvironmentProvider();

    emailQueueProcessor = new EmailQueueProcessor(environmentProvider);
  });

  it("should create an instance of EmailQueueProcessor correctly", () => {
    expect(emailQueueProcessor).toBeDefined();
    expect(environmentProvider).toBeInstanceOf(EnvironmentProvider);
  });

  it("should return a handler function from getHandler", () => {
    const handler = emailQueueProcessor.getHandler();
    expect(typeof handler).toBe("function");
  });
});
