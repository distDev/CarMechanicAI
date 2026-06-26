import { randomUUID } from 'node:crypto';

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from '@prisma/client';

import { expiresInToDate } from '@common/utils/parse-duration';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

import { AnonymousAuthDto } from '../dto/anonymous-auth.dto';
import { GoogleAuthDto } from '../dto/google-auth.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { AuthTokensResponseDto } from '../interfaces/auth-tokens-response.dto';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { GoogleUserInfo } from '../interfaces/google-user-info.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { GoogleAuthService } from './google-auth.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isAnonymous: true,
        name: true,
        avatarUrl: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async anonymousLogin(dto: AnonymousAuthDto): Promise<AuthTokensResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          isAnonymous: true,
          subscriptionTier: 'FREE',
        },
      });

      return this.issueTokensForSession(tx, user, {
        deviceId: dto.deviceId,
        platform: dto.platform,
      });
    });
  }

  async googleLogin(
    dto: GoogleAuthDto,
    currentUser?: AuthenticatedUser | null,
  ): Promise<AuthTokensResponseDto> {
    const googleProfile = await this.googleAuthService.verifyIdToken(
      dto.idToken,
    );

    return this.prisma.$transaction(async (tx) => {
      const user = await this.resolveGoogleUser(tx, googleProfile, currentUser);

      return this.issueTokensForSession(tx, user, {
        deviceId: dto.deviceId,
        platform: dto.platform,
      });
    });
  }

  async refresh(refreshToken: string): Promise<AuthTokensResponseDto> {
    let payload: JwtPayload;

    try {
      payload = await this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException();
    }

    const session = await this.sessionService.findActiveSessionById(
      payload.sessionId,
    );

    if (!session?.refreshTokenHash) {
      throw new UnauthorizedException();
    }

    const valid = await this.sessionService.compareRefreshToken(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!valid) {
      await this.sessionService.deleteAllUserSessions(payload.sub);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const newRefreshToken =
      await this.tokenService.generateRefreshToken(payload);
    const hash = await this.sessionService.hashRefreshToken(newRefreshToken);

    await this.prisma.$transaction(async (tx) => {
      await tx.deviceSession.update({
        where: { id: session.id },
        data: {
          refreshTokenHash: hash,
          lastActiveAt: new Date(),
        },
      });
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(sessionId: string) {
    await this.sessionService.deleteSession(sessionId);

    return {
      success: true,
    };
  }

  async logoutAll(userId: string) {
    await this.sessionService.deleteAllUserSessions(userId);

    return {
      success: true,
    };
  }

  private async resolveGoogleUser(
    tx: Prisma.TransactionClient,
    googleProfile: GoogleUserInfo,
    currentUser?: AuthenticatedUser | null,
  ): Promise<User> {
    if (currentUser?.isAnonymous) {
      return this.upgradeAnonymousUser(tx, currentUser.id, googleProfile);
    }

    const existingUser = await tx.user.findUnique({
      where: { googleId: googleProfile.googleId },
    });

    if (existingUser) {
      return tx.user.update({
        where: { id: existingUser.id },
        data: this.getGoogleProfileUpdateData(googleProfile),
      });
    }

    return tx.user.create({
      data: {
        isAnonymous: false,
        googleId: googleProfile.googleId,
        subscriptionTier: 'FREE',
        ...this.getGoogleProfileUpdateData(googleProfile),
      },
    });
  }

  private async upgradeAnonymousUser(
    tx: Prisma.TransactionClient,
    userId: string,
    googleProfile: GoogleUserInfo,
  ): Promise<User> {
    const existingByGoogle = await tx.user.findUnique({
      where: { googleId: googleProfile.googleId },
    });

    if (existingByGoogle && existingByGoogle.id !== userId) {
      throw new ConflictException(
        'Google account is already linked to another user',
      );
    }

    return tx.user.update({
      where: { id: userId },
      data: {
        isAnonymous: false,
        googleId: googleProfile.googleId,
        ...this.getGoogleProfileUpdateData(googleProfile),
      },
    });
  }

  private getGoogleProfileUpdateData(googleProfile: GoogleUserInfo) {
    return {
      email: googleProfile.email,
      name: googleProfile.name,
      avatarUrl: googleProfile.avatarUrl,
    };
  }

  private async issueTokensForSession(
    tx: Prisma.TransactionClient,
    user: Pick<User, 'id' | 'isAnonymous' | 'subscriptionTier'>,
    session: { deviceId: string; platform?: string },
  ): Promise<AuthTokensResponseDto> {
    const refreshExpiresIn = this.configService.getOrThrow<string>(
      'jwt.refreshExpiresIn',
    );
    const expiresAt = expiresInToDate(refreshExpiresIn);
    const sessionId = randomUUID();

    const payload: JwtPayload = {
      sub: user.id,
      sessionId,
      isAnonymous: user.isAnonymous,
      tier: user.subscriptionTier,
    };

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);
    const refreshTokenHash =
      await this.sessionService.hashRefreshToken(refreshToken);

    await tx.deviceSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        deviceId: session.deviceId,
        platform: session.platform,
        expiresAt,
        refreshTokenHash,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
