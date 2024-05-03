import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileRepositoryModule } from './repository/profile.repository.module';
import { ProfileController } from './profile.controller';

@Module({
  imports: [ProfileRepositoryModule],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
