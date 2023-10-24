import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [UserModule, MessageModule, ChatModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
