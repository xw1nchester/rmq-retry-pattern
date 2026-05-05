import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
    private logger = new Logger(TelegramService.name);
    private readonly token: string;
    private readonly chatId: string;

    constructor(private readonly configService: ConfigService) {
        this.token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
        this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
    }

    async sendMessage(text: string): Promise<void> {
        try {
            this.logger.log('Sending Telegram message');

            const response = await fetch(
                `https://api.telegram.org/bot${this.token}/sendMessage`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_id: this.chatId,
                        text
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                this.logger.error(
                    `Telegram API request failed: ${response.status} ${response.statusText}`,
                    JSON.stringify(data)
                );
                return;
            }

            this.logger.log('Telegram message sent successfully');
        } catch (error) {
            this.logger.error(
                'Unexpected error while sending Telegram message',
                error
            );
        }
    }
}
