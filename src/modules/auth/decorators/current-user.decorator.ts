import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedUser as CurrentUserPayload } from '../interfaces/authenticated-user.interface';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: CurrentUserPayload }>();

    return request.user;
  },
);
