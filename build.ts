import { config } from "dotenv";
import { execSync } from "child_process";

// Load environment variables from .env file
config();

// Execute tsc command
try {
  execSync("tsc", { stdio: "inherit" });
} catch (error) {
  console.error("Error during TypeScript compilation:", error);
  process.exit(1);
}
