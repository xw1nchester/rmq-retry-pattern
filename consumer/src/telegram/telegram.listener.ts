import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TelegramService } from './telegram.service';

@Injectable()
export class TelegramListener {
    constructor(private readonly telegramService: TelegramService) {}

    @OnEvent('message')
    async handleMessage(msg: string) {
        await this.telegramService.sendMessage(msg);
    }
}
