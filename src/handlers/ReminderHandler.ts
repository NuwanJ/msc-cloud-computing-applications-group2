import { IEventResult } from "../../types/APIGatewayTypes";
import { APIGatewayEventHandler } from "../lib/handlers/APIGatewayEventHandler";
import { IEnvironmentProvider } from "../lib/providers/EnvironmentProvider";
import { EventResult } from "../lib/handlers/EventHandler";
import { IDatabaseProvider } from "../lib/providers/DatabaseProvider";
import moment from "moment-timezone";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { IQueueProvider } from "../lib/providers/SQSQueueProvider";
import { AppointmentData } from "../../types/AppointmentTypes";
import AWS from "aws-sdk";
import { UserProfile } from "../../types/UserTypes";

export class ReminderHandler extends APIGatewayEventHandler {
  cognito = new AWS.CognitoIdentityServiceProvider({
    region: this.environmentProvider.getValue("REGION"),
  });

  async handle(): Promise<IEventResult> {
    console.log("Scheduler Event Occurred !");
    console.log("Current time:", moment());

    // Consider the appointments from one hour ahead for the Reminders
    const fromTime = moment().add(0, "minutes");
    const toTime = moment().add(60, "minutes");
    // const fromTime = moment().add(60, "minutes");
    // const toTime = moment().add(90, "minutes");

    console.log(`Looking appointments in between ${fromTime} and ${toTime}`);

    const queryParams: Partial<DocumentClient.ScanInput> = {
      FilterExpression: "startTime >= :start_at AND startTime <= :end_at",
      ExpressionAttributeValues: {
        ":start_at": moment(fromTime).format("YYYY-MM-DD HH:mm:ss"),
        ":end_at": moment(toTime).format("YYYY-MM-DD HH:mm:ss"),
      },
    };
    const dbResponse = await this.databaseProvider.scan(queryParams);
    console.log("Database Response", dbResponse);

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

  async processAppointments(items: AppointmentData[]) {
    const responseList = [];

    for (const item of items) {
      try {
        const user = await this.getUserData(item.patientId);
        console.log("Item", item, "User", user);

        if (user.enabled) {
          const resp = await this.emailSender.sendMessage({
            to: user.email,
            subject: "Appointment Reminder !",
            content: `You will have an appointment from ${item.startTime} to ${item.endTime} with ${item.doctorName}`,
          });
          console.log("SQS response", resp);

          responseList.push({ id: item.id, status: "success" });
        } else {
          console.warn("User is not active", user.email);
          responseList.push({ id: item.id, status: "user not active" });
        }
      } catch (error) {
        console.error("Error processing item:", error);
      }
    }

    return responseList;
  }

  async getUserData(username: string) {
    const params = {
      UserPoolId: this.environmentProvider.getValue("USER_POOL_ID"),
      Username: username,
    };

    const result = await this.cognito.adminGetUser(params).promise();
    const user = <UserProfile>{
      username: result.Username,
      email: result.UserAttributes.filter((attribute) => {
        return attribute.Name == "email";
      })[0].Value,
      status: result.UserStatus,
      enabled: result.Enabled,
      attributes: result.UserAttributes,
      createdAt: result.UserCreateDate,
      modifiedAt: result.UserLastModifiedDate,
    };

    return user;
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
