import dotenv from "dotenv";
import { Environment, IConfigType } from "../../types/";

// Loads environment variables from .env into process.env
dotenv.config();

const config: IConfigType = {
  ENV: (process.env.ENV as Environment) || Environment.DEV,
  AWS: {
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
};

export default config;
