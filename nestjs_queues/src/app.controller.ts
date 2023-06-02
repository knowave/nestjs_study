import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('queue')
  addMessageQueue(@Body('data') data: string) {
    return this.addMessageQueue(data);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
