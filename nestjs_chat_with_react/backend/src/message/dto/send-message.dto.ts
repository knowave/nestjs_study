import { User } from 'src/user/entities/user.entity';

export class SendMessageDto {
  sender: User;
  receiver: User;
  content: string;
}
