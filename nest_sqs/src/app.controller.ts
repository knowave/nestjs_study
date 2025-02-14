import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async createUser() {
    return this.appService.createUser();
  }

  @Post('poll')
  async pollMessage() {
    return this.appService.pollMessage();
  }
}
