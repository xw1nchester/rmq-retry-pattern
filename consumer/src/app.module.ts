import { Module } from '@nestjs/common';
import { ConsumerModule } from './consumer/consumer.module';
import { ConfigModule } from '@nestjs/config';
import { RabbitMqModule } from './rabbit-mq/rabbit-mq.module';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), ConsumerModule, RabbitMqModule]
})
export class AppModule {}
