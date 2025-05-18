import {
  Controller,
  Post,
  Req,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ActivityTrackingService } from './activity-tracking.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { TenantActiveSessionGuard } from '../auth/guards/tenant-active-session.guard';

@Controller('activity')
export class ActivityTrackingController {
  constructor(
    private readonly activityTrackingService: ActivityTrackingService,
  ) {}

  @Post('heartbeat')
  @UseGuards(AuthenticatedGuard, TenantActiveSessionGuard)
  async recordHeartbeat(@Req() req: Request) {
    const userId = req.session.userId;
    const tenant = (req as any).tenant;

    if (!userId || !tenant || !tenant.id) {
      throw new BadRequestException('Missing user ID or tenant context');
    }

    try {
      await this.activityTrackingService.recordActivity(
        userId,
        tenant.id,
        new Date(),
      );
      return { success: true };
    } catch (error) {
      console.error('Error recording activity:', error);
      throw new UnauthorizedException('Failed to record activity');
    }
  }

  @Post('check')
  @UseGuards(AuthenticatedGuard)
  async checkActive(@Req() req: Request) {
    const userId = req.session.userId;
    const tenant = (req as any).tenant;

    if (!userId || !tenant || !tenant.id) {
      throw new BadRequestException('Missing user ID or tenant context');
    }

    const isActive = await this.activityTrackingService.isTenantSessionActive(
      userId,
      tenant.id,
    );

    if (!isActive) {
      throw new UnauthorizedException('Tenant session has expired');
    }

    return { active: true };
  }
}
