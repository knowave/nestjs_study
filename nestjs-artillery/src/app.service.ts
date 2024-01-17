import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    for (let i = 0; i < 5; i++) {
      console.log(`쭉쭉 나간다. [${i}]`);
    }
    return 'Hello World!';
  }
}
