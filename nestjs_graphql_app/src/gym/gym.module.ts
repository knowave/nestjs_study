import { Module } from '@nestjs/common';
import { GymService } from './gym.service';
import { GymResolver } from './gym.resolver';

@Module({
  providers: [GymResolver, GymService]
})
export class GymModule {}
