import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { RabbitMqModule } from '../rabbit-mq/rabbit-mq.module';

@Module({
    imports: [RabbitMqModule],
    providers: [ConsumerService]
})
export class ConsumerModule {}
