import { Module } from '@nestjs/common';
import { KftcController } from './kftc.controller';
import { KftcService } from './kftc.service';

@Module({
  imports: [],
  controllers: [KftcController],
  exports: [KftcService],
  providers: [KftcService],
})
export class KftcModule {}
