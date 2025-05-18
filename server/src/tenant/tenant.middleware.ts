import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const hostname = req.hostname;

    // Skip for the main authentication domain
    if (hostname === 'login.myapp.lvh.me' || hostname === 'myapp.lvh.me') {
      return next();
    }

    // Extract subdomain from hostname
    let subdomain: string;
    if (hostname.includes('.myapp.lvh.me')) {
      subdomain = hostname.split('.myapp.lvh.me')[0];
    } else {
      return next(); // No valid subdomain found
    }

    // Find the corresponding tenant
    const tenant = await this.tenantService.getTenantBySubdomain(subdomain);

    if (tenant) {
      // Attach tenant to request object for use in controllers/services
      (req as any).tenant = tenant;
    }

    next();
  }
}
