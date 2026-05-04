import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMqModule } from './rabbitmq/rabbit-mq.module';
import { AppController } from './app.controller';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), RabbitMqModule],
    controllers: [AppController]
})
export class AppModule {}
