import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class AppService {
  constructor(@Inject('messageQueue') private messageQueue: Queue) {}

  async addMessageQueue(data: string) {
    const job = await this.messageQueue.add({
      data: data,
    });

    return job;
  }

  getHello(): string {
    return 'Hello World!';
  }
}
