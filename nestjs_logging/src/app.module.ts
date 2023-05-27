import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { CatModule } from './cat/cat.module';

@Module({
  imports: [LoggerModule, CatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
