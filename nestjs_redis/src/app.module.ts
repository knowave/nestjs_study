import { Module } from '@nestjs/common';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { MysqlModule } from './user/database/mysql.module';
import { REDIS_HOST, REDIS_PORT } from 'env';

@Module({
  imports: [
    CacheModule.register({
      host: REDIS_HOST,
      port: REDIS_PORT,
    }),
    UserModule,
    MysqlModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
