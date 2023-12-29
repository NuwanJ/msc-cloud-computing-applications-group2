import AWS from "aws-sdk";
import moment from "moment-timezone";
import { IEventResult } from "../../types/APIGatewayTypes";
import { APIGatewayEventHandler } from "../lib/handlers/APIGatewayEventHandler";
import { IEnvironmentProvider } from "../lib/providers/EnvironmentProvider";
import { EventResult } from "../lib/handlers/EventHandler";
import { IDatabaseProvider } from "../lib/providers/DatabaseProvider";
import { IQueueProvider } from "../lib/providers/SQSQueueProvider";
import { AppointmentData } from "../../types/AppointmentTypes";
import { getUserData } from "../lib/services/user";
import { SQSEmailPayload } from "../../types/SQSTypes";

export class ReminderHandler extends APIGatewayEventHandler {
  cognito = new AWS.CognitoIdentityServiceProvider({
    region: this.environmentProvider.getValue("Region"),
  });

  async handle(): Promise<IEventResult> {
    console.log("Scheduler Event occurred at", moment());

    // TODO Remove this
    const fromTime = moment().add(0, "minutes").format("YYYY-MM-DD HH:mm:ss");
    const toTime = moment().add(60, "minutes").format("YYYY-MM-DD HH:mm:ss");

    // Consider the appointments from one hour ahead for the Reminders
    // const fromTime = moment().add(60, "minutes").format("YYYY-MM-DD HH:mm:ss");
    // const toTime = moment().add(90, "minutes").format("YYYY-MM-DD HH:mm:ss");

    console.log(`Looking appointments in between ${fromTime} and ${toTime}`);

    const dbResponse = await this.databaseProvider.scan({
      FilterExpression: "startTime >= :start_at AND startTime <= :end_at",
      ExpressionAttributeValues: {
        ":start_at": fromTime,
        ":end_at": toTime,
      },
    });
    // console.log("Database Response", dbResponse);

    if (dbResponse.Count > 0) {
      const appointmentList = <AppointmentData[]>dbResponse.Items;
      console.log("Appointments", appointmentList);

      const responseList = await this.processAppointments(appointmentList);

      return new EventResult(
        { message: "Executed successfully", appointments: responseList },
        200
      );
    } else {
      return new EventResult(
        { message: "No appointment to be executed", appointments: [] },
        200
      );
    }
  }

  async processAppointments(appointments: AppointmentData[]) {
    const responseList = [];

    for (const appointment of appointments) {
      try {
        const user = await getUserData(
          this.cognito,
          this.environmentProvider.getValue("USER_POOL_ID"),
          appointment.patientId
        );
        console.log("Appointment", appointment, "User", user);

        if (user.enabled) {
          const emailData: SQSEmailPayload = {
            to: user.email,
            subject: "Appointment Reminder !",
            body: `You will have an appointment from ${appointment.startTime} to ${appointment.endTime} with ${appointment.doctorName}`,
          };
          const resp = await this.emailSender.sendMessage(emailData);

          console.log("SQS Response", resp);
          responseList.push({
            id: appointment.id,
            status: "success",
            msgId: resp.MessageId,
          });
        } else {
          console.warn("User is not active", user.email);
          responseList.push({
            id: appointment.id,
            status: "User is not active",
          });
        }
      } catch (error) {
        console.error("Error processing appointment:", error);
      }
    }

    return responseList;
  }

  constructor(
    public environmentProvider: IEnvironmentProvider,
    public databaseProvider: IDatabaseProvider,
    private emailSender: IQueueProvider
  ) {
    super(environmentProvider);

    // Set timezone
    moment.tz.setDefault(environmentProvider.getValue("Timezone"));
  }
}
