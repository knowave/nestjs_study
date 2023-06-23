import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  sendError(): string {
    throw new BadRequestException('ERROR!!');
  }
}
