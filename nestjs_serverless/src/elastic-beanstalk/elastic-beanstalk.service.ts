import { Injectable } from '@nestjs/common';
import { ElasticBeanstalk } from 'aws-sdk';
import { EnvironmentHealth } from 'aws-sdk/clients/elasticbeanstalk';

@Injectable()
export class ElasticBeanstalkService {
  private readonly elasticBeanstalk = new ElasticBeanstalk();

  async getEnvironmentStatus(
    environmentName: string,
  ): Promise<EnvironmentHealth> {
    const params = {
      EnvironmentNames: [environmentName],
    };

    const res = await this.elasticBeanstalk
      .describeEnvironments(params)
      .promise()
      .catch((e) => {
        throw new Error(e.message);
      });

    const environment = res.Environments[0];
    return environment ? environment.Health : null;
  }

  async restartEnvironment(environmentName: string): Promise<void> {
    const params = {
      EnvironmentName: environmentName,
    };

    await this.elasticBeanstalk.restartAppServer(params).promise();
  }
}
