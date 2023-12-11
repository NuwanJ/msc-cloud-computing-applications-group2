export enum Environment {
  DEV = "dev",
  STAGGING = "stagging",
  TEST = "test",
  PROD = "prod",
}

// Configuration ytpes
export interface IConfigType {
  ENV: Environment;
  AWS: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}
