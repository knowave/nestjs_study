import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway(81, { namespace: 'chat' })
export class ChatGateway {
  @WebSocketServer()
  server;
  wsClients = [];

  @SubscribeMessage('hihi')
  connectSomeOne(@MessageBody() data: string, @ConnectedSocket() client: any) {
    const [nickname, room] = data;
    console.log(`${nickname}님이 코드: ${room}방에 입장하셨습니다. `);
    const comeOn = `${nickname}님이 입장했습니다.`;
    this.server.emit('comeOn' + room, comeOn);
    this.wsClients.push(client);
  }

  private broadcast(event: any, client: any, message: any) {
    for (let c of this.wsClients) {
      if (client.id == c.id) continue;
      c.emit(event, message);
    }
  }

  @SubscribeMessage('send')
  sendMessage(@MessageBody() data: string, @ConnectedSocket() client: any) {
    const [room, nickname, message] = data;
    console.log(`${client.id} : ${data}`);
    this.broadcast(room, client, [nickname, message]);
  }
}
