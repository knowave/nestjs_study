import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ElasticBeanstalkModule } from './elastic-beanstalk/elastic-beanstalk.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ElasticBeanstalkModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
