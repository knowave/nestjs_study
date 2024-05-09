import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MysqlModule } from './user/database/mysql.module';
import { REDIS_HOST, REDIS_PORT } from 'env';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
    }),
    RedisModule.forRoot({
      config: {
        host: REDIS_HOST,
        port: +REDIS_PORT,
      },
    }),
    UserModule,
    MysqlModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
