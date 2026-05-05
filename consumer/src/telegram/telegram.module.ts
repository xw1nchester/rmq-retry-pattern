import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramListener } from './telegram.listener';

@Module({
    providers: [TelegramListener, TelegramService]
})
export class TelegramModule {}
