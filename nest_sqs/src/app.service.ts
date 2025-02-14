import { Injectable } from '@nestjs/common';
import { SqsService } from './sqs/sqs.service';

@Injectable()
export class AppService {
  constructor(private readonly sqsService: SqsService) {}

  async createUser() {
    const body = {
      username: 'tester',
      email: 'test@test.com',
      password: 'test1234',
    };

    const message = JSON.stringify(body);
    await this.sqsService.sendMessage(message);
  }

  async pollMessage() {
    await this.sqsService.pollMessage();
  }
}
