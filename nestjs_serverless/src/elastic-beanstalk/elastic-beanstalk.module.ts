import { Module } from '@nestjs/common';
import { ElasticBeanstalkService } from './elastic-beanstalk.service';

@Module({
  providers: [ElasticBeanstalkService]
})
export class ElasticBeanstalkModule {}
