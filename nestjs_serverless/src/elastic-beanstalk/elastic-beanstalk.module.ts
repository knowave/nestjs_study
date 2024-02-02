import { Module } from '@nestjs/common';
import { ElasticBeanstalkService } from './elastic-beanstalk.service';

@Module({
  providers: [ElasticBeanstalkService],
  exports: [ElasticBeanstalkService],
})
export class ElasticBeanstalkModule {}
