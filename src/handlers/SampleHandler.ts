import { IEventResult, RequestType } from "../../types/APIGatewayTypes";
import { APIGatewayEventHandler } from "../lib/APIGatewayEventHandler";
import { IEnvironmentProvider } from "../lib/EnvironmentProvider";
import { EventResult } from "../lib/EventHandler";
import * as AWS from 'aws-sdk';
export class SampleHandler extends APIGatewayEventHandler {
  // Path formats:
  // - /sample
  // - /sample/{action}
  async handle(): Promise<IEventResult> {
    if (this.event.requestContext.httpMethod === RequestType.GET) {
      return new EventResult(
        {
          message: "This is a sample message for a GET request",
          request: {
            query: this.getQueryStringParameters(),
            path: this.getPathParameters(),
          },
        },
        200
      );
    } else if (this.event.requestContext.httpMethod === RequestType.POST) {
      // if(this.event.path == "/user"){
        return this.createUser();
      // }
      // return new EventResult(
      //   {
      //     message: "This is a sample message for a POST request",
      //     request: {
      //       query: this.getQueryStringParameters(),
      //       path: this.getPathParameters(),
      //       body: this.getBody(),
      //     },
      //   },
      //   200
      // );
    } else {
      return this.sampleFunction();
    }

    return new EventResult(null, 404);
  }

  async sampleFunction(): Promise<IEventResult> {
    return new EventResult({ Sample: "This is a sample function" }, 200);
  }


  async createUser(): Promise<IEventResult> {
    if (this.event.requestContext.httpMethod !== RequestType.POST) {
        return new EventResult({ message: "Method not allowed" }, 405);
    }

    const body = this.getBody();
    const username  = body.username as string;
    const email = body.email as string;
    const password = body.password as string;
    // const { username, email, password }  = body;

    if (!username || !email || !password) {
        return new EventResult({ message: "Missing required fields" }, 400);
    }

    const cognito = new AWS.CognitoIdentityServiceProvider({
        region: 'us-east-1',
    });

    const params = {
        UserPoolId: 'us-east-1_4PWxUyQI5',
        Username: username,
        UserAttributes: [
            { Name: 'email', Value: email }
        ],
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
