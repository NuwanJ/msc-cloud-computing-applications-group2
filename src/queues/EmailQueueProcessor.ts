import moment from "moment-timezone";
import { SES } from "aws-sdk";
import { SQSRecord } from "aws-lambda";
import { SQSEventHandler } from "../lib/handlers/SQSEventHandler";
import { IEnvironmentProvider } from "../lib/providers/EnvironmentProvider";
import { SendEmailRequest } from "aws-sdk/clients/ses";
import { SQSEmailPayload } from "../../types/SQSTypes";

export class EmailQueueProcessor extends SQSEventHandler {
  private ses = new SES({
    region: this.environmentProvider.getValue("Region"),
  });

  async handle(): Promise<void> {
    console.info({
      message: "Incoming Email event",
      context: this.event,
    });

    const record: SQSRecord = this.event.Records[0];
    const emailRequest = <SQSEmailPayload>JSON.parse(record.body);

    console.log({
      to: emailRequest.to,
      subject: emailRequest.subject,
      body: emailRequest.body,
    });

    const SOURCE_EMAIL_ADDRESS =
      this.environmentProvider.getValue("SourceEmailAddress");

    // Send verification Email, this only requred once
    // This step is only required since we haven't a approved email domain

    try {
      await this.ses.verifyEmailAddress(
        {
          EmailAddress: emailRequest.to,
        },
        (err, data) => {
          if (err) {
            console.error("Error verifying email address:", err);
          } else {
            console.log("Verification email sent:", data);
          }
        }
      );
    } catch (verificationErr) {
      console.error("Error verifying email address:", verificationErr);
    }

    // Compose the email
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

    // Send the Email
    try {
      const emailResponse = await this.ses.sendEmail(params).promise();
      console.log("Email Response:", emailResponse);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  constructor(public environmentProvider: IEnvironmentProvider) {
    super(environmentProvider);

    // Set timezone
    moment.tz.setDefault(environmentProvider.getValue("Timezone"));
  }
}
