import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    //  this is first check to see if the user is authenticated.
    return (
      request.session?.userId !== undefined &&
      request.session?.isAuthenticated === true
    );
  }
}
