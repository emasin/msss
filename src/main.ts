import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
const logger = new Logger('Main');
const microserviceOptions = {
  name: 'GREETING_SERVICE',
  transport: Transport.REDIS,
  options: {
    host: '127.0.0.1',
    port: 6379,
    auth_pass: 'devnewmingcache',
  },
};
async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    AppModule,
    microserviceOptions,
  );
  await app.listen();
}
bootstrap();
