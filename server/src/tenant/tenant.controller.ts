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
    if (!userId) {
      return [];
    }

    // In a real app, i will fetch user's tenants from the user service
    // For now, i will return all tenants
    return this.tenantService.getAllTenants();
  }

  @Get('current')
  getCurrentTenant(@Req() req: Request): Tenant | undefined {
    return (req as any).tenant;
  }
}
