import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  findAll() {
    return `This action returns all chat`;
  }
}
