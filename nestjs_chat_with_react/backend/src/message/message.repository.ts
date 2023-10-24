import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessageRepository extends Repository<Message> {
  constructor(private readonly dataSource: DataSource) {
    super(Message, dataSource.createEntityManager());
  }

  async createChat({ sender, receiver }: CreateChatDto): Promise<Message> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const createChat = queryRunner.manager.create(Message, {
        sender,
        receiver,
      });
      const savedChat = await queryRunner.manager.save(createChat);
      await queryRunner.commitTransaction();
      return savedChat;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      await queryRunner.release();
    }
  }

  async sendMessage(sendMessageDto: SendMessageDto): Promise<Message> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { sender, receiver, content } = sendMessageDto;
      const createMessage = queryRunner.manager.create(Message, {
        sender,
        receiver,
        content,
      });
      const savedMessage = await queryRunner.manager.save(createMessage);
      await queryRunner.commitTransaction();
      return savedMessage;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      await queryRunner.release();
    }
  }

  async markAsRead(messageId: number): Promise<void> {
    try {
      const message = await this.findOne({ where: { id: messageId } });

      if (message) {
        message.read = true;
        await this.save(message);
      }
    } catch (err) {
      throw new Error(err);
    }
  }
}
