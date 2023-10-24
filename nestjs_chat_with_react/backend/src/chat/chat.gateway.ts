import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway()
export class ChatGateway {
  constructor(
    private readonly chatService: MessageService,
    private readonly userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createChat')
  async handleCreateChat(
    client: any,
    payload: { senderId: number; receiverId: number },
  ) {
    const sender = await this.userService.getUserById(payload.senderId);
    const receiver = await this.userService.getUserById(payload.receiverId);

    if (sender && receiver) {
      const chat = await this.chatService.createChat({ sender, receiver });
      client.emit('chatCreated', chat);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: any,
    payload: { senderId: number; receiverId: number; content: string },
  ) {
    const sender = await this.userService.getUserById(payload.senderId);
    const receiver = await this.userService.getUserById(payload.receiverId);
    const content = payload.content;

    if (sender && receiver) {
      const message = await this.chatService.sendMessage({
        sender,
        receiver,
        content,
      });
      client.emit('messageSend', message);
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: any, messageId: number) {
    await this.chatService.markAsRead(messageId);
  }
}
