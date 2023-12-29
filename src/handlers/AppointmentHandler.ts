import { IEventResult, RequestType } from "../../types/APIGatewayTypes";
import { AppointmentRequest } from "../../types/AppointmentTypes";
import { APIGatewayEventHandler } from "../lib/APIGatewayEventHandler";
import { IEnvironmentProvider } from "../lib/EnvironmentProvider";
import { EventResult } from "../lib/EventHandler";
import { IDatabaseProvider } from "../lib/DatabaseProvider";
import { v4 as uuidv4 } from "uuid";
import { ISessionProvider } from "../lib/SessionProvider";
import moment from "moment-timezone";

export class AppointmentHandler extends APIGatewayEventHandler {
  async handle(): Promise<IEventResult> {
    if (this.getMethod() === RequestType.PUT) {
      if (this.getPathParam("action") == "create") {
        // Create an appointment
        return this.bookAppointment();
      }
    } else if (this.getMethod() === RequestType.POST) {
      if (this.getPathParam("action") == "update") {
        // Update an appointment
        return this.updateAppointment();
      }
    } else if (this.getMethod() === RequestType.GET) {
      if (this.getPathParam("action") == "all") {
        // Get all appointments belong to specific user
        return this.retrieveAllAppointments();
      } else if (this.getPathParam("action") == "view") {
        // Get a specific appointment
        return this.retrieveAppointment();
      }
    } else if (this.getMethod() === RequestType.DELETE) {
      if (this.getPathParam("action") == "delete") {
        // Delete an appointment
        return this.deleteAppointment();
      }
    }

    return new EventResult(null, 404);
  }

  async bookAppointment(): Promise<IEventResult> {
    const { doctorName, startTime, endTime } = <AppointmentRequest>(
      this.getBody()
    );

    if (!startTime || !endTime || !doctorName) {
      return new EventResult({ message: "Missing required fields" }, 400);
    }

    // Generate a unique ID using uuid
    const appointmentId = uuidv4();

    const appointmentData = {
      id: appointmentId,
      patientId: this.sessionProvider.getUserId(),
      doctorName: doctorName,
      startTime: moment(startTime).format("YYYY-MM-DD HH:mm:ss"),
      endTime: moment(endTime).format("YYYY-MM-DD HH:mm:ss"),
    };

    try {
      await this.databaseProvider.putItem(appointmentData);
      return new EventResult(
        {
          message: "Appointment booked successfully",
          appointment: appointmentData,
        },
        201
      );
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error booking appointment" }, 500);
    }
  }

  async retrieveAppointment(): Promise<IEventResult> {
    try {
      const appointmentId = this.getPathParam("appointmentId");

      if (!appointmentId) {
        return new EventResult(
          { message: "Missing appointmentId parameter" },
          400
        );
      }

      // Fetch the existing appointment from the database
      const existingAppointment =
        await this.databaseProvider.getItem<AppointmentRequest>({
          id: appointmentId,
        });

      if (!existingAppointment) {
        return new EventResult({ message: "Appointment not found" }, 404);
      }
      return new EventResult({ ...existingAppointment }, 200);
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error retrieving appointments" }, 500);
    }
  }

  async retrieveAllAppointments(): Promise<IEventResult> {
    const patientId = this.sessionProvider.getUserId();
    try {
      const queryResult = await this.databaseProvider.scan({
        FilterExpression: "patientId = :patientId",
        ExpressionAttributeValues: { ":patientId": patientId },
      });

      return new EventResult({ appointments: queryResult.Items }, 200);
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error retrieving appointments" }, 500);
    }
  }

  async updateAppointment(): Promise<IEventResult> {
    try {
      const appointmentId = this.getPathParam("appointmentId");
      const { doctorName, startTime, endTime } = this.getBody();

      if (!appointmentId) {
        return new EventResult(
          { message: "Missing appointmentId parameter" },
          400
        );
      }

      const updatedValues = {
        doctorName,
        startTime: moment(startTime).format("YYYY-MM-DD HH:mm:ss"),
        endTime: moment(endTime).format("YYYY-MM-DD HH:mm:ss"),
      };

      // Fetch the existing appointment from the database
      const existingAppointment =
        await this.databaseProvider.getItem<AppointmentRequest>({
          id: appointmentId,
        });

      if (!existingAppointment) {
        return new EventResult({ message: "Appointment not found" }, 404);
      }

      await this.databaseProvider.updateItem(appointmentId, updatedValues);

      return new EventResult(
        {
          message: "Appointment updated successfully",
          appointment: { id: appointmentId, ...updatedValues },
        },
        200
      );
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error updating appointment" }, 500);
    }
  }

  async deleteAppointment(): Promise<IEventResult> {
    try {
      const appointmentId = this.getPathParam("appointmentId");

      if (!appointmentId) {
        return new EventResult(
          { message: "`appointmentId` not provided" },
          400
        );
      }

      await this.databaseProvider.deleteItem(appointmentId);

      return new EventResult(
        { message: "Appointment deleted successfully", id: appointmentId },
        200
      );
    } catch (error) {
      console.error(error);
      return new EventResult({ message: "Error deleting appointment" }, 500);
    }
  }

  constructor(
    public environmentProvider: IEnvironmentProvider,
    public sessionProvider: ISessionProvider,
    public databaseProvider: IDatabaseProvider
  ) {
    super(environmentProvider);
  }
}
