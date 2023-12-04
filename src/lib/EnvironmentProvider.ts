export interface IEnvironmentProvider {
  getValue(key: string): string;
  getEnvObject(): Record<string, string>;
}

export class EnvironmentProvider implements IEnvironmentProvider {
  private readonly env: Record<string, string>;

  getEnvObject(): any {
    return this.env;
  }

  getValue(key: string): string {
    if (this.getEnvObject()[key]) {
      return this.getEnvObject()[key];
    }

    return null;
  }

  constructor() {
    this.env = process.env;
  }
}
