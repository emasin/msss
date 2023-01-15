import { Controller, Get, Logger } from "@nestjs/common";
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
const logger = new Logger('AppController');
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'getMagazines' })
  getHello() {
    logger.log('getHello');
  }
}
