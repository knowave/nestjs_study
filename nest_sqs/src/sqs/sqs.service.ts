import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SendMessageCommandOutput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import 'dotenv/config';

@Injectable()
export class SqsService {
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;

  constructor() {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION || 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.queueUrl = process.env.AWS_SQS_QUEUE_URL || '';
  }

  async sendMessage(message: string): Promise<SendMessageCommandOutput> {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: message,
      MessageGroupId: 'test-group',
    });

    try {
      const result = await this.sqsClient.send(command);
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  async pollMessage() {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 10,
    });

    const response = await this.sqsClient.send(command);

    if (response.Messages.length === 0) return;

    for (const message of response.Messages) {
      const data = JSON.parse(message.Body);
      console.log(data);
      await this.deleteMessage(message.ReceiptHandle);
    }
  }

  async deleteMessage(receiptHandle: string) {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      });

      const result = await this.sqsClient.send(command);
      console.log('🗑️ Message deleted from SQS', result);
    } catch (err) {
      throw new Error(err);
    }
  }
}
