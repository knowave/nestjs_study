import { Module } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProfileRepository],
  exports: [ProfileRepository],
})
export class ProfileRepositoryModule {}
