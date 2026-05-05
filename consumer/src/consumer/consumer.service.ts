import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConsumeMessage } from 'amqplib';
import { RabbitMqService } from '../rabbit-mq/rabbit-mq.service';

@Injectable()
export class ConsumerService {
    private logger = new Logger(ConsumerService.name);
    // simple in-memory store
    private processed = new Map<string, boolean>();

    constructor(
        private readonly rabbit: RabbitMqService,
        private readonly eventEmitter: EventEmitter2
    ) {}

    async onModuleInit() {
        const ch = this.rabbit.getChannel();

        await ch.consume('main-queue', this.handleMessage.bind(this));
    }

    private handleMessage(msg: ConsumeMessage | null) {
        if (!msg) return;

        const ch = this.rabbit.getChannel();
        const data = JSON.parse(msg.content.toString());
        const messageId = msg.properties.messageId;

        if(!data?.content) {
            this.logger.warn(
                `Invalid payload, content is required, messageId=${messageId}`
            );
            ch.ack(msg);
            return;
        }

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

            this.eventEmitter.emit('message', data.content)

            this.processed.set(messageId, true);

            ch.ack(msg);

            this.logger.log(`Processed successfully, messageId=${messageId}`);
        } catch (err) {
            this.logger.error(
                `Processing failed, messageId=${messageId}`,
                err instanceof Error ? err.message : String(err)
            );

            this.rabbit.retryMessage(msg, 3);
        }
    }
}
