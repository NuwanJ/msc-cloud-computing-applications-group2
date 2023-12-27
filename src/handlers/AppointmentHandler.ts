import { IEventResult, RequestType } from "../../types/APIGatewayTypes";
import { AppointmentRequest } from "../../types/AppointmentTypes";
import { APIGatewayEventHandler } from "../lib/APIGatewayEventHandler";
import { IEnvironmentProvider } from "../lib/EnvironmentProvider";
import { EventResult } from "../lib/EventHandler";
import { IDatabaseProvider } from "../lib/DatabaseProvider";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 as uuidv4 } from 'uuid';

export class AppointmentHandler extends APIGatewayEventHandler {
  async handle(): Promise<IEventResult> {
    if (this.event.requestContext.httpMethod === RequestType.POST) {
      if (this.getPathParam("action") == "book-appointment") {
        return this.bookAppointment();
      }
    }
    else if (this.event.requestContext.httpMethod === RequestType.GET) {
      if (this.getPathParam("action") == "view-all-appointments") {
        return this.retrieveAllAppointments();
      }
      if (this.getPathParam("action") == "view-appointment") {
        return this.retrieveAppointment();
      }
    } else if (this.event.requestContext.httpMethod === RequestType.PUT) {
      if (this.getPathParam("action") == "update-appointment") {
        return this.updateAppointment();
      }
    } else if (this.event.requestContext.httpMethod === RequestType.DELETE) {
      if (this.getPathParam("action") == "delete-appointment") {
        return this.deleteAppointment();
      }
    }

    return new EventResult(null, 404);
  }

  async bookAppointment(): Promise<IEventResult> {
    const { patientName, patientId, startTimePoint, endTimePoint } = <AppointmentRequest>this.getBody();

    if (!patientName || !startTimePoint || !endTimePoint) {
      return new EventResult({ message: "Missing required fields" }, 400);
    }

    // Generate a unique ID using uuid
    const appointmentId = uuidv4();

    const appointmentData = {
      id: appointmentId,
      PatientId: patientId,
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

  async retrieveAllAppointments(): Promise<IEventResult> {
    try {
      const scanParams: Partial<DocumentClient.ScanInput> = {
        TableName: this.environmentProvider.getValue("AppointmentTable"),
      };

      const scanResult = await this.databaseProvider.scan(scanParams);

      return new EventResult({ appointments: scanResult.Items }, 200);
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error retrieving appointments" }, 500);
    }
  }

  async retrieveAppointment(): Promise<IEventResult> {
    try {
      const appointmentId = this.getPathParam("appointmentId");

      if (!appointmentId) {
        return new EventResult({ message: "Missing appointmentId parameter" }, 400);
      }

      // Fetch the existing appointment from the database
      const existingAppointment = await this.databaseProvider.getItem<AppointmentRequest>({ id: appointmentId });

      if (!existingAppointment) {
        return new EventResult({ message: "Appointment not found" }, 404);
      }
      return new EventResult({ appointment: existingAppointment }, 200);
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error retrieving appointments" }, 500);
    }
  }


  async updateAppointment(): Promise<IEventResult> {
    try {
      const appointmentId = this.getPathParam("appointmentId");

      if (!appointmentId) {
        return new EventResult({ message: "Missing appointmentId parameter" }, 400);
      }

      const updatedValues = { ...this.getBody(), appointmentId };

      // Fetch the existing appointment from the database
      const existingAppointment = await this.databaseProvider.getItem<AppointmentRequest>({ id: appointmentId });

      if (!existingAppointment) {
        return new EventResult({ message: "Appointment not found" }, 404);
      }

      await this.databaseProvider.updateItem(appointmentId, updatedValues);

      return new EventResult({ message: "Appointment updated successfully" }, 200);
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error updating appointment" }, 500);
    }
  }

  async deleteAppointment(): Promise<IEventResult> {
    try {
      const appointmentId = this.getPathParam("appointmentId");

      if (!appointmentId) {
        return new EventResult({ message: "Appointment ID not provided" }, 400);
      }

      await this.databaseProvider.deleteItem(appointmentId);

      return new EventResult({ message: "Appointment deleted successfully" }, 200);
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error deleting appointment" }, 500);
    }
  }

  constructor(
    public environmentProvider: IEnvironmentProvider,
    public databaseProvider: IDatabaseProvider
  ) {
    super(environmentProvider);
  }
}
