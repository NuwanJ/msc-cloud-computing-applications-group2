import { SQS } from "aws-sdk";
import {
  GetQueueAttributesRequest,
  AttributeNameList,
  GetQueueAttributesResult,
  SendMessageResult,
  SendMessageRequest,
  MessageBodyAttributeMap,
} from "aws-sdk/clients/sqs";

import { Level } from "../../../types/APIGatewayTypes";

export type QueueMessage = {
  messageId?: string;
  receiptHandle?: string;
  body?: object;
};

export interface IQueueProvider {
  deleteMessage(receiptHandle: string): Promise<object>;

  receiveMessages(): Promise<Array<QueueMessage>>;

  sendMessage(
    messageBody: object,
    messageAttributes?: Record<string, string>,
    delaySeconds?: number
  ): Promise<SQS.SendMessageResult>;

  getQueueAttributes(
    attributes: AttributeNameList
  ): Promise<GetQueueAttributesResult>;
}

export function getMessageBodyAttributeMap(
  attributes: Record<string, string>
): MessageBodyAttributeMap {
  const resultset: MessageBodyAttributeMap = {};

  for (const key of Object.keys(attributes)) {
    resultset[key] = { DataType: "String", StringValue: attributes[key] };
  }

  return resultset;
}

export class SQSServiceProvider implements IQueueProvider {
  private readonly sqs: SQS = new SQS();

  async deleteMessage(receiptHandle: string): Promise<object> {
    const params: SQS.Types.DeleteMessageRequest = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    };

    return this.sqs
      .deleteMessage(params)
      .promise()
      .then(
        (data) => {
          return data;
        },
        (err) => {
          throw err;
        }
      );
  }

  async receiveMessages(): Promise<Array<QueueMessage>> {
    const params: SQS.Types.ReceiveMessageRequest = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 2,
    };

    return this.sqs
      .receiveMessage(params)
      .promise()
      .then(
        (data) => {
          if (!data.Messages) {
            return [];
          }

          return data.Messages.map((message) => {
            return <QueueMessage>{
              messageId: message.MessageId,
              body: JSON.parse(message.Body),
              receiptHandle: message.ReceiptHandle,
            };
          });
        },
        (err) => {
          throw err;
        }
      );
  }

  //   async execSendMessage(
  //     params: Partial<SQS.Types.SendMessageRequest>
  //   ): Promise<SQS.Types.SendMessageResult> {
  //     const request: SQS.Types.SendMessageRequest = {
  //       QueueUrl: this.queueUrl, // allow caller override,
  //       MessageBody: params.MessageBody,
  //       ...params,
  //     };
  //     console.log({
  //       level: Level.Debug,
  //       message: "Attempting SQS message delivery",
  //       context: params,
  //     });
  //     return this.sqs.sendMessage(request).promise();
  //   }

  async sendMessage(
    messageBody: object,
    messageAttributes?: Record<string, string>,
    delaySeconds?: number
  ): Promise<SQS.SendMessageResult> {
    const params: SQS.Types.SendMessageRequest = {
      MessageBody: JSON.stringify(messageBody),
      QueueUrl: this.queueUrl,
    };

    console.log("Temp", params);

    if (messageAttributes) {
      params.MessageAttributes = getMessageBodyAttributeMap(messageAttributes);
    }

    if (delaySeconds) {
      params.DelaySeconds = delaySeconds;
    }

    console.log({
      level: Level.Debug,
      message: "Attempting standard SQS message delivery",
      context: { messageAttributes, messageBody, queueUrl: this.queueUrl },
    });

    return this.sqs
      .sendMessage(params)
      .promise()
      .then(
        (data) => {
          return data;
        },
        (err) => {
          throw err;
        }
      );
  }

  async getQueueAttributes(
    attributes: AttributeNameList
  ): Promise<GetQueueAttributesResult> {
    const params: GetQueueAttributesRequest = {
      QueueUrl: this.queueUrl,
      AttributeNames: attributes,
    };

    console.log({
      level: Level.Debug,
      message: "Attempting standard SQS get queue attributes",
      context: { params },
    });

    return this.sqs
      .getQueueAttributes(params)
      .promise()
      .then(
        (data) => {
          return data;
        },
        (err) => {
          throw err;
        }
      );
  }

  constructor(public readonly queueUrl: string) {}
}
