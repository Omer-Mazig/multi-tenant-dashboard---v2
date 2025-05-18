import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticatedGuard.name);

  // this is first check to see if the user is authenticated.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const canPass =
      request.session?.userId !== undefined &&
      request.session?.isAuthenticated === true;

    if (!canPass) {
      this.logger.error('User not authenticated');
    } else {
      this.logger.log('User authenticated');
    }

    return canPass;
  }
}
