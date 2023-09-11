import { Module } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { TrainerResolver } from './trainer.resolver';

@Module({
  providers: [TrainerResolver, TrainerService]
})
export class TrainerModule {}
