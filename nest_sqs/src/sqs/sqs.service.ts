import { SQSClient } from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import 'dotenv/config';

@Injectable()
export class SqsService {
  private readonly sqsClient: SQSClient;

  constructor() {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION || 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
}
