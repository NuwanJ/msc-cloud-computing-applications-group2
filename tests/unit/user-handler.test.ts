import { UserHandler } from "../../src/handlers/UserHandler";
import { EnvironmentProvider } from "../../src/lib/providers/EnvironmentProvider";
import { SessionProvider } from "../../src/lib/providers/SessionProvider";

jest.mock("../../src/lib/providers/EnvironmentProvider");
jest.mock("../../src/lib/providers/SessionProvider");

describe("UserHandler", () => {
  let environmentProvider;
  let sessionProvider;
  let userHandler;

  beforeEach(() => {
    environmentProvider = new EnvironmentProvider();
    sessionProvider = new SessionProvider(environmentProvider);

    userHandler = new UserHandler(environmentProvider, sessionProvider);
  });

  it("should create an instance of UserHandler correctly", () => {
    expect(userHandler).toBeDefined();
    expect(environmentProvider).toBeInstanceOf(EnvironmentProvider);
    expect(sessionProvider).toBeInstanceOf(SessionProvider);
  });

  it("should return a handler function from getHandler", () => {
    const handler = userHandler.getHandler();
    expect(typeof handler).toBe("function");
  });
});
