import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('messageQueue')
export class AppConsumer {
  private readonly logger = new Logger(AppConsumer.name);

  @Process('tase')
  getMessageQueue(job: Job) {
    this.logger.log(`${job.data.data}의 작업이 수행됐습니다.`);
  }
}
