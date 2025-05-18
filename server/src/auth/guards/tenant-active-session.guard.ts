import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { Tenant } from '../../types';
import { ActivityTrackingService } from '../../activity-tracking/activity-tracking.service';

@Injectable()
export class TenantActiveSessionGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => ActivityTrackingService))
    private readonly activityTrackingService: ActivityTrackingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // First check if the user is authenticated at all
    if (!request.session?.userId || !request.session?.isAuthenticated) {
      throw new UnauthorizedException('Not authenticated');
    }

    const userId = request.session.userId;
    const tenant = (request as any).tenant as Tenant;

    // If no tenant is found in the request, this is not a tenant-specific route
    if (!tenant) {
      return true;
    }

    // Check if the user has access to this tenant
    if (!this.authService.isUserInTenant(userId, tenant.id)) {
      throw new UnauthorizedException(
        'User does not have access to this tenant',
      );
    }

    // Check if the user's session for this tenant is still active
    const isActive = await this.activityTrackingService.isTenantSessionActive(
      userId,
      tenant.id,
    );

    if (!isActive) {
      // Set the tenant session as inactive in the session object
      if (!request.session.activeTenants) {
        request.session.activeTenants = {};
      }
      request.session.activeTenants[tenant.id] = {
        lastActivity: new Date(),
        isActive: false,
      };

      throw new UnauthorizedException(
        'Tenant session has expired due to inactivity',
      );
    }

    // Record this activity
    await this.activityTrackingService.recordActivity(
      userId,
      tenant.id,
      new Date(),
    );

    return true;
  }
}
