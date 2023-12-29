import { SQSRecord } from "aws-lambda";
import { SQSEventHandler } from "../lib/SQSEventHandler";
import { SES } from "aws-sdk";
import moment from "moment-timezone";
import { IEnvironmentProvider } from "../lib/EnvironmentProvider";
import {
  SendEmailRequest,
  VerifyEmailAddressRequest,
} from "aws-sdk/clients/ses";

export class EmailSenderQueue extends SQSEventHandler {
  private ses = new SES({
    region: this.environmentProvider.getValue("REGION"),
  });

  async handle(): Promise<void> {
    console.info({
      message: "Incoming email event",
      context: JSON.stringify(this.event),
    });

    const record: SQSRecord = this.event.Records[0];
    const payload = JSON.parse(record.body);

    try {
      const {
        to: email_address,
        subject: email_subject,
        content: email_content,
      } = payload;

      console.log(email_address, email_subject, email_content);

      const SOURCE_EMAIL_ADDRESS =
        this.environmentProvider.getValue("SourceEmailAddress");

      const params = <SendEmailRequest>{
        Destination: {
          ToAddresses: [email_address],
        },
        Message: {
          Body: {
            Text: {
              Data: email_content,
            },
          },
          Subject: {
            Data: email_subject,
          },
        },
        Source: SOURCE_EMAIL_ADDRESS,
        ReplyToAddresses: [SOURCE_EMAIL_ADDRESS],
      };

      const verifyParams = <VerifyEmailAddressRequest>{
        EmailAddress: email_address,
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
      }

      // Send the Email
      try {
        const data = await this.ses.sendEmail(params).promise();
        console.log("Email sent:", data);
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
