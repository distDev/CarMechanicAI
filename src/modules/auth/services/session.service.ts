import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/infrastructure/prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async hashRefreshToken(refreshToken: string): Promise<string> {
    return bcrypt.hash(refreshToken, 10);
  }

  async compareRefreshToken(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
  }

  async findActiveSessionById(sessionId: string) {
    return this.prisma.deviceSession.findFirst({
      where: {
        id: sessionId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async deleteSession(sessionId: string) {
    return this.prisma.deviceSession.delete({
      where: {
        id: sessionId,
      },
    });
  }

  async deleteAllUserSessions(userId: string) {
    return this.prisma.deviceSession.deleteMany({
      where: {
        userId,
      },
    });
  }
}
