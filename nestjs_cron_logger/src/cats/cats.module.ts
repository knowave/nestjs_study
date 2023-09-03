import { Logger, Module } from '@nestjs/common';
import { CatsService } from './cats.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [CatsService, Logger],
})
export class CatsModule {}
