import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { UserRepositoryModule } from 'src/user/repository/user.repository.module';

@Module({
  imports: [UserModule, UserRepositoryModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
