import { IEventResult, RequestType } from "../../types/APIGatewayTypes";
import { AppointmentRequest } from "../../types/AppointmentTypes";
import { APIGatewayEventHandler } from "../lib/APIGatewayEventHandler";
import { IEnvironmentProvider } from "../lib/EnvironmentProvider";
import { EventResult } from "../lib/EventHandler";
import { IDatabaseProvider } from "../lib/DatabaseProvider";
import { v4 as uuidv4 } from 'uuid';
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

    // Generate a unique ID using uuid
    const appointmentId = uuidv4();

    const appointmentData = {
      id: appointmentId,
      PatientName: patientName,
      StartTimePoint: startTimePoint,
      EndTimePoint: endTimePoint,
    };

    try {
      await this.databaseProvider.putItem(appointmentData)
      return new EventResult({ message: "Appointment booked successfully", appointmentId: appointmentId },
        201);
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error booking appointment" }, 500);
    }
  }

  constructor(
    public environmentProvider: IEnvironmentProvider,
    public databaseProvider: IDatabaseProvider
  ) {
    super(environmentProvider);
  }
}
