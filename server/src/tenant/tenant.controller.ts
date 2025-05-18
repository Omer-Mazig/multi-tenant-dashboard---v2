import { Controller, Get, Req } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Request } from 'express';
import { Tenant } from '../types';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  getTenants(@Req() req: Request): Tenant[] {
    const userId = req.session.userId;
    // If no user is logged in, return empty array
    if (!userId) {
      return [];
    }

    // In a real app, we'd fetch user's tenants from the user service
    // For now, we'll return all tenants
    return this.tenantService.getAllTenants();
  }

  @Get('current')
  getCurrentTenant(@Req() req: Request): Tenant | undefined {
    // The tenant is attached to the request by the TenantMiddleware
    return (req as any).tenant;
  }
}
