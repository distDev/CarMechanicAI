import { Module } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ChatController } from './controllers/chat.controller';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
