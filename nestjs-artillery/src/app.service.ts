import { Injectable } from '@nestjs/common';
import { GetHelloInput, GetHelloOutput } from './dto/get-hello.dto';

@Injectable()
export class AppService {
  getHello({ index }: GetHelloInput): GetHelloOutput {
    const messages = [];
    for (let i = 1; i < index + 1; i++) {
      messages.push(`[${i}]번째 지나갈게요!`);
    }

    return { messages };
  }
}
