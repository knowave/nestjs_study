import { Module } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CatsController } from './cats.controller';
import { CatsRepository } from './cats.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cats } from './entities/cats.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cats])],
  providers: [CatsService, CatsRepository],
  controllers: [CatsController],
})
export class CatsModule {}
