import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = AuthenticatedUser>(
    err: Error | null,
    user: TUser | false,
  ): TUser | null {
    if (err || !user) {
      return null;
    }

    return user;
  }
}
