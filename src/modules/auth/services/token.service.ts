import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, this.getAccessSignOptions());
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, this.getRefreshSignOptions());
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    const decoded = await this.jwtService.verifyAsync<
      JwtPayload & { exp?: number; iat?: number }
    >(token, {
      secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
    });

    return this.toJwtPayload(decoded);
  }

  private toJwtPayload(
    decoded: JwtPayload & { exp?: number; iat?: number },
  ): JwtPayload {
    return {
      sub: decoded.sub,
      sessionId: decoded.sessionId,
      isAnonymous: decoded.isAnonymous,
      tier: decoded.tier,
    };
  }

  private getAccessSignOptions(): JwtSignOptions {
    return {
      secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
      expiresIn: this.configService.getOrThrow('jwt.accessExpiresIn'),
    };
  }

  private getRefreshSignOptions(): JwtSignOptions {
    return {
      secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn: this.configService.getOrThrow('jwt.refreshExpiresIn'),
    };
  }
}
