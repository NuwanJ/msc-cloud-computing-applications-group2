import * as jwt from "jsonwebtoken";
import { TokenPayload } from "../../types/SessionProviderTypes";
import { IEnvironmentProvider } from "./EnvironmentProvider";

export interface ISessionProvider {
  getUserId(): string;
  getToken(): string;
  setToken(token: string): void;
  decodeToken(): TokenPayload;
  getUserName(): string;
}

export class SessionProvider {
  token: string;

  getToken(): string {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  decodeToken(): TokenPayload {
    try {
      const decodedToken: TokenPayload = jwt.decode(this.token);
      console.log("Decoded Token:", decodedToken);
      return decodedToken;
    } catch (error) {
      console.error(error);
      return <TokenPayload>{};
    }
  }

  getUserName(): string {
    const tokenDecoded = this.decodeToken();
    return tokenDecoded.email;
  }

  getUserId(): string {
    const tokenDecoded = this.decodeToken();
    return tokenDecoded["cognito:username"];
  }

  constructor(private environmentProvider: IEnvironmentProvider) {}
}
