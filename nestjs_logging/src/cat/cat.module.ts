import { Module } from '@nestjs/common';
import { CatService } from './cat.service';
import { LoggerModule } from 'src/logger/logger.module';
import { MyLogger } from 'src/logger/my-logger.service';

@Module({
  imports: [LoggerModule],
  providers: [CatService, MyLogger],
})
export class CatModule {}
