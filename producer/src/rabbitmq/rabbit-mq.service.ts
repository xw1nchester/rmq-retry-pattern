import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { v4 } from 'uuid';

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
    private connection: amqp.ChannelModel;
    private channel: amqp.Channel;
    private logger = new Logger(RabbitMqService.name);

    async onModuleInit() {
        this.connection = await amqp.connect('amqp://localhost');
        this.channel = await this.connection.createChannel();
    }

    async onModuleDestroy() {
        await this.channel?.close();
        await this.connection?.close();
    }

    publish(payload: any) {
        const messageId = v4();

        this.logger.log(`Publishing message, messageId=${messageId}`);

        this.channel.publish(
            'main-exchange',
            'main',
            Buffer.from(JSON.stringify(payload)),
            { persistent: true, messageId }
        );
    }
}
