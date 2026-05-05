import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConsumerModule } from './consumer/consumer.module';
import { TelegramModule } from './telegram/telegram.module';
import { RabbitMqModule } from './rabbit-mq/rabbit-mq.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        EventEmitterModule.forRoot(),
        ConsumerModule,
        RabbitMqModule,
        TelegramModule
    ]
})
export class AppModule {}
