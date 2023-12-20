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
            Data: "This is the message body.", // Your email body content
          },
        },
        Subject: {
          Data: "Subject of the email", // Your email subject
        },
      },
      Source: "nuwanjaliyagoda@gmail.com", // Email address verified in SES console
    };

    const verifyParams = {
      EmailAddress: email, // Replace with the email address to verify
    };

    try {
      this.ses.verifyEmailAddress(verifyParams, async (err, data) => {
        if (err) {
          console.error("Error verifying email address:", err);
          return new EventResult(
            { message: "Error verifying email address" },
            500
          );
        } else {
          console.log("Verification email sent:", data);

          try {
            const data = await this.ses.sendEmail(params).promise();
            console.log("Email sent:", data);
            return new EventResult(
              { message: "Email sent successfully!" },
              200
            );
          } catch (error) {
            console.error("Error sending email:", error);
            return new EventResult({ message: "Error sending email" }, 500);
          }
        }
      });
    } catch (verificationErr) {
      console.error("Error verifying email address:", verificationErr);
      return new EventResult({ message: "Error verifying email address" }, 500);
    }
  }

  constructor(public environmentProvider: IEnvironmentProvider) {
    super(environmentProvider);
  }
}
