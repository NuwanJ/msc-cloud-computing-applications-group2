import { IEventResult } from "../../types/APIGatewayTypes";
import { APIGatewayEventHandler } from "../lib/APIGatewayEventHandler";
import { IEnvironmentProvider } from "../lib/EnvironmentProvider";
import { SES } from "aws-sdk";
import { EventResult } from "../lib/EventHandler";
import { ReminderRequestType } from "../../types/ReminderTypes";

export class ReminderHandler extends APIGatewayEventHandler {
  ses = new SES({ region: this.environmentProvider.getValue("REGION") });

  async handle(): Promise<IEventResult> {
    console.log("Scheduler Event Occurred !");

    const { email } = <ReminderRequestType>this.getBody();

    const params = {
      Destination: {
        ToAddresses: [email], // Email addresses to send the email to
      },
      Message: {
        Body: {
          Text: {
            Data: "This is the message body.",
          },
        },
        Subject: {
          Data: "Subject of the email",
        },
      },
      Source: "nuwanjaliyagoda@gmail.com",
    };

    const verifyParams = {
      EmailAddress: email,
    };

    // Send verification Email, this only requred once
    try {
      await this.ses.verifyEmailAddress(verifyParams, (err, data) => {
        if (err) {
          console.error("Error verifying email address:", err);
        } else {
          console.log("Verification email sent:", data);
        }
      });
    } catch (verificationErr) {
      console.error("Error verifying email address:", verificationErr);
      return new EventResult({ message: "Error verifying email address" }, 500);
    }

    // Send the Email
    try {
      const data = await this.ses.sendEmail(params).promise();
      console.log("Email sent:", data);
      return new EventResult({ message: "Email sent successfully!" }, 200);
    } catch (error) {
      console.error("Error sending email:", error);
      return new EventResult({ message: "Error sending email" }, 500);
    }
  }

  constructor(public environmentProvider: IEnvironmentProvider) {
    super(environmentProvider);
  }
}
