import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMqService {
    private connection: amqp.ChannelModel;
    private channel: amqp.Channel;
    private logger = new Logger(RabbitMqService.name);

    constructor(private readonly configService: ConfigService) {}

    async onModuleInit() {
        this.connection = await amqp.connect(
            this.configService.get<string>('RMQ_URL')
        );
        this.channel = await this.connection.createChannel();

        await this.setup();
    }

    async setup() {
        this.logger.log('RMQ initizalization...');

        await this.channel.assertExchange('main-exchange', 'direct', {
            durable: true
        });

        await this.channel.assertExchange('retry-exchange', 'direct', {
            durable: true
        });

        await this.channel.assertQueue('main-queue', {
            durable: true,
            deadLetterExchange: 'retry-exchange',
            deadLetterRoutingKey: 'retry'
        });

        await this.channel.assertQueue('retry-queue', {
            durable: true,
            messageTtl: 5000,
            deadLetterExchange: 'main-exchange',
            deadLetterRoutingKey: 'main'
        });

        await this.channel.assertQueue('dead-queue', {
            durable: true
        });

        await this.channel.bindQueue('main-queue', 'main-exchange', 'main');
        await this.channel.bindQueue('retry-queue', 'retry-exchange', 'retry');
        await this.channel.bindQueue('dead-queue', 'main-exchange', 'dead');

        this.logger.log('Queues created');
    }

    async onModuleDestroy() {
        await this.channel?.close();
        await this.connection?.close();
    }

    getChannel() {
        return this.channel;
    }

    retryMessage(msg: amqp.ConsumeMessage, maxRetries = 3) {
        const messageId = msg.properties.messageId;
        const headers = msg.properties.headers || {};
        const retries = headers['x-retries'] || 0;

        const content = msg.content;

        this.logger.log(
            `Retry handling message, messageId=${messageId} retries=${retries}, max=${maxRetries}`
        );

        if (retries >= maxRetries) {
            this.logger.warn(
                `Max retries reached → sending to DLQ, messageId=${messageId} retries=${retries}`
            );

            this.channel.publish('main-exchange', 'dead', content, {
                persistent: true,
                headers
            });

            this.channel.ack(msg);

            this.logger.log('Message moved to DLQ');

            return;
        }

        this.channel.publish('retry-exchange', 'retry', content, {
            persistent: true,
            messageId,
            headers: {
                ...headers,
                'x-retries': retries + 1
            }
        });

        this.channel.ack(msg);
    }
}
