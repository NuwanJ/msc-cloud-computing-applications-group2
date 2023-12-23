import { IEventResult } from "../../types/APIGatewayTypes";
import { APIGatewayEventHandler } from "../lib/APIGatewayEventHandler";
import { IEnvironmentProvider } from "../lib/EnvironmentProvider";
import { SES } from "aws-sdk";
import { EventResult } from "../lib/EventHandler";
import { ReminderRequestType } from "../../types/ReminderTypes";
import { IDatabaseProvider } from "../lib/DatabaseProvider";
import moment from "moment-timezone";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const TIMEZONE = "Asia/Colombo";

export class ReminderHandler extends APIGatewayEventHandler {
  private ses = new SES({
    region: this.environmentProvider.getValue("REGION"),
  });

  async handle(): Promise<IEventResult> {
    console.log("Scheduler Event Occurred !");
    console.log("Current time:", moment());

    const fromTime = moment();
    const toTime = moment().add(30, "minutes");

    console.log(`Looking appointments in between ${fromTime} and ${toTime}`);
    // const { email } = <ReminderRequestType>this.getBody();

    const queryParams: Partial<DocumentClient.QueryInput> = {
      TableName: this.environmentProvider.getValue("AppointmentTable"),
      FilterExpression: "startTime >= :start_at AND startTime <= :end_at",
      ExpressionAttributeValues: {
        ":start_at": fromTime,
        ":end_at": toTime,
      },
    };

    const dbResponse = await this.databaseProvider.query(queryParams);
    console.log("Database Response", dbResponse);

    if (dbResponse.Items) {
      const appointmentList = dbResponse.Items;

      appointmentList.forEach((item) => {
        // TODO: complete this
        console.log("Item", item);
      });
    }

    // const params = {
    //   Destination: {
    //     ToAddresses: ["email"], // Email addresses to send the email to
    //   },
    //   Message: {
    //     Body: {
    //       Text: {
    //         Data: "This is the message body.",
    //       },
    //     },
    //     Subject: {
    //       Data: "Subject of the email",
    //     },
    //   },
    //   Source: "nuwanjaliyagoda@gmail.com",
    // };

    // const verifyParams = {
    //   EmailAddress: email,
    // };

    // // Send verification Email, this only requred once
    // try {
    //   await this.ses.verifyEmailAddress(verifyParams, (err, data) => {
    //     if (err) {
    //       console.error("Error verifying email address:", err);
    //     } else {
    //       console.log("Verification email sent:", data);
    //     }
    //   });
    // } catch (verificationErr) {
    //   console.error("Error verifying email address:", verificationErr);
    //   return new EventResult({ message: "Error verifying email address" }, 500);
    // }

    // // Send the Email
    // try {
    //   const data = await this.ses.sendEmail(params).promise();
    //   console.log("Email sent:", data);
    //   return new EventResult({ message: "Email sent successfully!" }, 200);
    // } catch (error) {
    //   console.error("Error sending email:", error);
    //   return new EventResult({ message: "Error sending email" }, 500);
    // }

    console.log("Success");
    return new EventResult({ message: "Executed successfully" }, 200);
  }

  constructor(
    public environmentProvider: IEnvironmentProvider,
    public databaseProvider: IDatabaseProvider
  ) {
    super(environmentProvider);

    // Set timezone
    moment.tz.setDefault(TIMEZONE);
  }
}
