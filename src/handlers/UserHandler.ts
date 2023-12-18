import { IEventResult, RequestType } from "../../types/APIGatewayTypes";
import { UserRegisterRequest } from "../../types/UserTypes";
import { APIGatewayEventHandler } from "../lib/APIGatewayEventHandler";
import { IEnvironmentProvider } from "../lib/EnvironmentProvider";
import { EventResult } from "../lib/EventHandler";
import * as AWS from "aws-sdk";

export class UserHandler extends APIGatewayEventHandler {
  async handle(): Promise<IEventResult> {
    if (this.event.requestContext.httpMethod === RequestType.GET) {
      // Nothing for now
    } else if (this.event.requestContext.httpMethod === RequestType.POST) {
      if (this.getPathParam("action") == "register") {
        return this.createUser();
      } else if (this.getPathParam("action") == "login") {
        return this.loginUser();
      }
    }

    return new EventResult(null, 404);
  }

  async loginUser(): Promise<IEventResult> {
    try {
      return new EventResult({ message: "User login" }, 201);
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error login user" }, 500);
    }
  }

  async createUser(): Promise<IEventResult> {
    const { username, email, password } = <UserRegisterRequest>this.getBody();

    if (!username || !email || !password) {
      return new EventResult({ message: "Missing required fields" }, 400);
    }

    const cognito = new AWS.CognitoIdentityServiceProvider({
      region: "us-east-1",
    });

    const params = {
      UserPoolId: this.environmentProvider.getValue("USER_POOL_ID"),
      Username: username,
      UserAttributes: [{ Name: "email", Value: email }],
      TemporaryPassword: password,
    };

    try {
      await cognito.adminCreateUser(params).promise();
      return new EventResult({ message: "User created successfully" }, 201);
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error creating user" }, 500);
    }
  }

  constructor(public environmentProvider: IEnvironmentProvider) {
    super(environmentProvider);
  }
}
