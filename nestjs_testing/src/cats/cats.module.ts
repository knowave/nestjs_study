import { Module } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CatsController } from './cats.controller';
import { CatsRepository } from './cats.repository';

@Module({
  providers: [CatsService, CatsRepository],
  controllers: [CatsController],
})
export class CatsModule {}
