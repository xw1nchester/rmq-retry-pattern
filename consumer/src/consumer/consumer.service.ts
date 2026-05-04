import { Injectable, Logger } from '@nestjs/common';
import { RabbitMqService } from '../rabbit-mq/rabbit-mq.service';
import { ConsumeMessage } from 'amqplib';

@Injectable()
export class ConsumerService {
    private logger = new Logger(ConsumerService.name);
    // simple in-memory store
    private processed = new Map<string, boolean>();

    constructor(private readonly rabbit: RabbitMqService) {}

    async onModuleInit() {
        const ch = this.rabbit.getChannel();

        await ch.consume('main-queue', this.handleMessage.bind(this));
    }

    private handleMessage(msg: ConsumeMessage | null) {
        if (!msg) return;

        const ch = this.rabbit.getChannel();
        // const data = JSON.parse(msg.content.toString());
        const messageId = msg.properties.messageId;

        if (this.processed.has(messageId)) {
            this.logger.warn(
                `Duplicate message skipped, messageId=${messageId}`
            );
            ch.ack(msg);
            return;
        }

        try {
            this.logger.debug(`Processing started, messageId=${messageId}`);

            // error simulation
            if (Math.random() < 0.5) {
                throw new Error('Temporary error');
            }

            this.processed.set(messageId, true);

            ch.ack(msg);

            this.logger.log(`Processed successfully, messageId=${messageId}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);

            this.logger.error(
                `Processing failed, messageId=${messageId}, error=${message}`
            );

            // ch.nack(msg, false, false);
            this.rabbit.retryMessage(msg, 3);
        }
    }
}
