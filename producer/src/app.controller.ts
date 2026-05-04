import { Body, Controller, Post } from '@nestjs/common';
import { MessageRequestDto } from './dto/message-request.dto';
import { RabbitMqService } from './rabbitmq/rabbit-mq.service';

@Controller()
export class AppController {
    constructor (private readonly rabbitMqService: RabbitMqService) {}

    @Post()
    sendMessage(@Body() dto: MessageRequestDto) {
        return this.rabbitMqService.publish(dto);
    }
}
