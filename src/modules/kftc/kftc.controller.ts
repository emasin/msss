import {
  Body,
  Controller,
  Get,
  Param,
  Query,
  Logger,
  Post,
  HttpStatus,
} from '@nestjs/common';
import { KftcService } from './kftc.service';

@Controller('msss/kftc')
export class KftcController {
  private readonly logger = new Logger(KftcController.name);
  constructor(private readonly service: KftcService) {}

  @Get('/callback')
  async callback(@Param() params, @Query() query): Promise<string> {
    const k = query;
    this.logger.log('params', params);
    this.logger.log('query', query);
    return query;
  }
}
