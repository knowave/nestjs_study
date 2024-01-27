import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  testServerless(): string {
    return 'Welcome To Serverless!!!';
  }
}
