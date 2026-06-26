import { OAuth2Client } from 'google-auth-library';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GoogleUserInfo } from '../interfaces/google-user-info.interface';

@Injectable()
export class GoogleAuthService {
  private readonly client = new OAuth2Client();

  constructor(private readonly configService: ConfigService) {}

  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    const clientId = this.configService.getOrThrow<string>('google.clientId');

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();

      if (!payload?.sub) {
        throw new UnauthorizedException('Invalid Google token');
      }

      return {
        googleId: payload.sub,
        email: payload.email ?? null,
        name: payload.name ?? null,
        avatarUrl: payload.picture ?? null,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
