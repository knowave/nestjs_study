import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageRepository } from './message.repository';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: MessageRepository,
  ) {}

  async createChat(createChatDto: CreateChatDto): Promise<Message> {
    return await this.messageRepository.createChat(createChatDto);
  }

  async sendMessage(sendMessageDto: SendMessageDto): Promise<Message> {
    return await this.messageRepository.sendMessage(sendMessageDto);
  }

  async markAsRead(messageId: number): Promise<void> {
    return await this.messageRepository.markAsRead(messageId);
  }
}
