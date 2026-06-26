import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from '@/infrastructure/prisma/prisma.module';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { GoogleAuthService } from './services/google-auth.service';
import { SessionService } from './services/session.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    PrismaModule,
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    TokenService,
    SessionService,
    GoogleAuthService,
    JwtStrategy,
  ],

  exports: [PassportModule, JwtStrategy, TokenService, SessionService],
})
export class AuthModule {}
