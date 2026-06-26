import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../decorators/current-user.decorator';
import { AnonymousAuthDto } from '../dto/anonymous-auth.dto';
import { GoogleAuthDto } from '../dto/google-auth.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import { AuthTokensResponseDto } from '../interfaces/auth-tokens-response.dto';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { LogoutResponseDto } from '../interfaces/logout-response.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.authService.getMe(user.id);
  }

  @Post('anonymous')
  @ApiOperation({ summary: 'Create anonymous user and issue auth tokens' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  anonymous(@Body() dto: AnonymousAuthDto) {
    return this.authService.anonymousLogin(dto);
  }

  @Post('google')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Sign in with Google or upgrade anonymous user to Google account',
  })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid Google ID token' })
  @ApiConflictResponse({
    description: 'Google account is already linked to another user',
  })
  google(
    @Body() dto: GoogleAuthDto,
    @CurrentUser() user?: AuthenticatedUser | null,
  ) {
    return this.authService.googleLogin(dto, user);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token and issue new auth tokens' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or reused refresh token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate current device session' })
  @ApiOkResponse({ type: LogoutResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  logout(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logout(user.sessionId);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate all device sessions for current user' })
  @ApiOkResponse({ type: LogoutResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  logoutAll(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logoutAll(user.id);
  }
}
