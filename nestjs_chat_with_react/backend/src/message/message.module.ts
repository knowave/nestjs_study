import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageRepository } from './message.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageService, MessageRepository],
})
export class MessageModule {}
