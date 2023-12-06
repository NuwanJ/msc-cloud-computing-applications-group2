import type { Config } from "jest";

const config: Config = {
  cache: true,
  cacheDirectory: "<rootDir>/.cache/jest",
  preset: "ts-jest",
  roots: ["<rootDir>/src"],
  // setupFiles: ["<rootDir>/setupEnv.ts"],
  testEnvironment: "node",
  // transform: {
  //   "\\.[jt]sx?$": "ts-jest",
  // },
  transformIgnorePatterns: ["/node_modules/"],
  verbose: true,
  testMatch: ["**/tests/unit/**.test.ts"],
};

export default config;
