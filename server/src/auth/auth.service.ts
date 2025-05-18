import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
  ) {}

  async validateUser(username: string, password: string): Promise<string> {
    const user = this.userService.findByUsername(username);

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user.id;
  }

  async login(username: string, password: string): Promise<{ userId: string }> {
    const userId = await this.validateUser(username, password);
    return { userId };
  }

  async getUserTenants(userId: string) {
    const tenantIds = this.userService.getUserTenants(userId);
    const tenants = this.tenantService.getTenantsForUser(tenantIds);
    return tenants;
  }

  isUserInTenant(userId: string, tenantId: string): boolean {
    return this.userService.isUserInTenant(userId, tenantId);
  }
}
