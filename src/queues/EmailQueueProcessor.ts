import { SQSRecord } from "aws-lambda";
import { SQSEventHandler } from "../lib/handlers/SQSEventHandler";
import { SES } from "aws-sdk";
import moment from "moment-timezone";
import { IEnvironmentProvider } from "../lib/providers/EnvironmentProvider";
import {
  SendEmailRequest,
  VerifyEmailAddressRequest,
} from "aws-sdk/clients/ses";
import { SQSEmailPayload } from "../../types/SQSTypes";

export class EmailQueueProcessor extends SQSEventHandler {
  private ses = new SES({
    region: this.environmentProvider.getValue("Region"),
  });

  async handle(): Promise<void> {
    console.info({
      message: "Incoming Email event",
      context: JSON.stringify(this.event),
    });

    const record: SQSRecord = this.event.Records[0];
    const emailRequest = <SQSEmailPayload>JSON.parse(record.body);

    try {
      console.log({
        to: emailRequest.to,
        subject: emailRequest.subject,
        body: emailRequest.body,
      });

      const SOURCE_EMAIL_ADDRESS =
        this.environmentProvider.getValue("SourceEmailAddress");

      const params = <SendEmailRequest>{
        Destination: {
          ToAddresses: [emailRequest.to],
        },
        Message: {
          Body: {
            Text: {
              Data: emailRequest.body,
            },
          },
          Subject: {
            Data: emailRequest.subject,
          },
        },
        Source: SOURCE_EMAIL_ADDRESS,
        ReplyToAddresses: [SOURCE_EMAIL_ADDRESS],
      };

      // Send verification Email, this only requred once
      // This step is only required since we haven't a approved email domain
      const verifyParams = <VerifyEmailAddressRequest>{
        EmailAddress: emailRequest.to,
      };
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
      }

      // Send the Email
      try {
        const emailResponse = await this.ses.sendEmail(params).promise();
        console.log("Email Response:", emailResponse);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    } catch (exception) {
      console.log("Email sending failed", exception);
      throw new Error("Email sending failed");
    }
  }

  constructor(public environmentProvider: IEnvironmentProvider) {
    super(environmentProvider);

    // Set timezone
    moment.tz.setDefault(environmentProvider.getValue("Timezone"));
  }
}
