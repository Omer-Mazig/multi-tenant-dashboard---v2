import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Check if the session contains userId and isAuthenticated flag
    return (
      request.session?.userId !== undefined &&
      request.session?.isAuthenticated === true
    );
  }
}
