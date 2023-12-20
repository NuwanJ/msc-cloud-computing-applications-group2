import { IEventResult, RequestType } from "../../types/APIGatewayTypes";
import { AppointmentRequest } from "../../types/AppointmentTypes";
import { APIGatewayEventHandler } from "../lib/APIGatewayEventHandler";
import { IEnvironmentProvider } from "../lib/EnvironmentProvider";
import { EventResult } from "../lib/EventHandler";
import * as AWS from "aws-sdk";

export class AppointmentHandler extends APIGatewayEventHandler {
  async handle(): Promise<IEventResult> {
    if (this.event.requestContext.httpMethod === RequestType.POST) {
      if (this.getPathParam("action") == "book-appointment") {
        return this.bookAppointment();
      }
    }
    else if (this.event.requestContext.httpMethod === RequestType.GET) {
      //TODO implement retrieve
    }

    return new EventResult(null, 404);
  }

  async bookAppointment(): Promise<IEventResult> {
    const { patientName, startTimePoint, endTimePoint } = <AppointmentRequest>this.getBody();

    if (!patientName || !startTimePoint || !endTimePoint) {
      return new EventResult({ message: "Missing required fields" }, 400);
    }

    const cognito = new AWS.CognitoIdentityServiceProvider({
      region: "us-east-1",
    });

    const params = {
      AppointmentPoolId: this.environmentProvider.getValue("APPOINTMENT_POOL_ID"),
      AppointmentDetails: [{ Name: "PatientName", Value: patientName }]
    };

    try {
      //TODO clarify what method from cognito to use.
      await cognito.(params).promise();
      return new EventResult({ message: "Appointment booked successfully" }, 201);
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error booking appointment" }, 500);
    }
  }

  constructor(public environmentProvider: IEnvironmentProvider) {
    super(environmentProvider);
  }
}
