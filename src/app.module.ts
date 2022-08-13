import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KftcModule } from './modules/kftc/kftc.module';

@Module({
  imports: [KftcModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
