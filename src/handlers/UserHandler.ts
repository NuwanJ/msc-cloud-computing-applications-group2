import * as AWS from "aws-sdk";
import { IEventResult, RequestType } from "../../types/APIGatewayTypes";
import {
  AuthInfo,
  RefreshTokenRequest,
  UserLoginRequest,
  UserRegisterRequest,
} from "../../types/UserTypes";
import { APIGatewayEventHandler } from "../lib/handlers/APIGatewayEventHandler";
import { IEnvironmentProvider } from "../lib/providers/EnvironmentProvider";
import { ISessionProvider } from "../lib/providers/SessionProvider";
import { EventResult } from "../lib/handlers/EventHandler";
import { getUserData, initiateAuth } from "../lib/services/user";
export class UserHandler extends APIGatewayEventHandler {
  cognito = new AWS.CognitoIdentityServiceProvider({
    region: this.environmentProvider.getValue("Region"),
  });

  async handle(): Promise<IEventResult> {
    if (this.event.requestContext.resourcePath == "/profile/{action}") {
      if (this.getMethod() === RequestType.GET) {
        if (this.getPathParam("action") == "info") {
          return this.profile();
        } else {
          return new EventResult(null, 404);
        }
      }
    } else if (this.event.requestContext.resourcePath == "/user/{action}") {
      if (this.getMethod() === RequestType.POST) {
        if (this.getPathParam("action") == "register") {
          return this.register();
        } else if (this.getPathParam("action") == "login") {
          return this.login();
        } else if (this.getPathParam("action") == "token") {
          return this.refreshAuth();
        } else {
          return new EventResult(null, 404);
        }
      }
    }
    return new EventResult(null, 404);
  }

  async getAuthInfoByRefreshToken(refreshToken: string): Promise<AuthInfo> {
    return await initiateAuth(this.cognito, {
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: this.environmentProvider.getValue("USER_POOL_CLIENT"),
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });
  }

  async getAuthInfoByUsernamePassword(
    username: string,
    password: string
  ): Promise<AuthInfo> {
    return await initiateAuth(this.cognito, {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: this.environmentProvider.getValue("USER_POOL_CLIENT"),
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });
  }

  // [POST] /user/login
  // body: {username, password}
  async login(): Promise<IEventResult> {
    const { username, password } = <UserLoginRequest>this.getBody();

    try {
      const { accessToken, expiresIn, refreshToken } =
        await this.getAuthInfoByUsernamePassword(username, password);
      return new EventResult(
        {
          message: "User logged in successfully",
          accessToken,
          expiresIn,
          refreshToken,
        },
        201
      );
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error login user", username }, 500);
    }
  }

  // [POST] /user/token
  // body: {refreshToken}
  async refreshAuth(): Promise<IEventResult> {
    try {
      const { refreshToken } = <RefreshTokenRequest>this.getBody();
      const {
        accessToken,
        expiresIn,
        refreshToken: newRefreshToken,
      } = await this.getAuthInfoByRefreshToken(refreshToken);
      return new EventResult(
        {
          message: "A new access token generated successfully",
          expiresIn,
          accessToken,
          refreshToken: newRefreshToken,
        },
        201
      );
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error refreshing token" }, 500);
    }
  }

  // [POST] /user/register
  // body: {username, password}
  async register(): Promise<IEventResult> {
    const { username, password } = <UserRegisterRequest>this.getBody();

    if (!username || !password) {
      return new EventResult({ message: "Missing required fields" }, 400);
    }

    const params = {
      UserPoolId: this.environmentProvider.getValue("USER_POOL_ID"),
      Username: username,
      // TODO Add more parameters
      UserAttributes: [{ Name: "email", Value: username }],
      TemporaryPassword: password,
      MessageAction: "SUPPRESS",
    };

    try {
      await this.cognito.adminCreateUser(params).promise();
      await this.cognito
        .adminSetUserPassword({
          UserPoolId: this.environmentProvider.getValue("USER_POOL_ID"),
          Username: username,
          Password: password,
          Permanent: true,
        })
        .promise();

      const { accessToken, expiresIn, refreshToken } =
        await this.getAuthInfoByUsernamePassword(username, password);

      return new EventResult(
        {
          message: "User created successfully",
          username,
          accessToken,
          expiresIn,
          refreshToken,
        },
        201
      );
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error creating user", error }, 500);
    }
  }

  // [GET] /profile/info
  async profile(): Promise<IEventResult> {
    try {
      const username = this.sessionProvider.getUserName();

      try {
        const userData = await getUserData(
          this.cognito,
          this.environmentProvider.getValue("USER_POOL_ID"),
          username
        );
        return new EventResult(userData, 200);
      } catch (error) {
        console.error(error);
        return new EventResult({ message: "Error fetching user", error }, 500);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      return new EventResult({ message: "Error decoding token" }, 500);
    }
  }
  constructor(
    public environmentProvider: IEnvironmentProvider,
    public sessionProvider: ISessionProvider
  ) {
    super(environmentProvider, sessionProvider);
  }
}
