import { Injectable, Logger } from '@nestjs/common';
import { ElasticBeanstalkService } from './elastic-beanstalk/elastic-beanstalk.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger();
  constructor(
    private readonly elasticBeanStalkService: ElasticBeanstalkService,
  ) {}

  async handleEvent(): Promise<string> {
    const environmentName = process.env.EB_ENVIRONMENT_NAME;
    const environmentStatus =
      await this.elasticBeanStalkService.getEnvironmentStatus(environmentName);

    if (environmentStatus !== 'ok' && environmentStatus !== 'info') {
      await this.elasticBeanStalkService.restartEnvironment(environmentName);
      this.logger.log('환경 재시작이 되었습니다.');
      return '환경 재시작이 되었습니다.';
    } else {
      this.logger.log(
        '환경 상태가 정상으로 판단되어 재부팅을 실행하지 않습니다.',
      );
      return '환경 상태가 정상으로 판단되어 재부팅을 실행하지 않습니다.';
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  testServerless(): string {
    return 'Welcome To Serverless!!!';
  }
}
