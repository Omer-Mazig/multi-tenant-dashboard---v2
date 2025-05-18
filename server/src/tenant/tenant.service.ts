import { Injectable } from '@nestjs/common';
import { Tenant } from '../types';

@Injectable()
export class TenantService {
  // In-memory tenant storage
  private tenants: Tenant[] = [
    { id: '1', name: 'Tenant 1', subdomain: 'tenant1' },
    { id: '2', name: 'Tenant 2', subdomain: 'tenant2' },
    { id: '3', name: 'Tenant 3', subdomain: 'tenant3' },
  ];

  getAllTenants(): Tenant[] {
    return [...this.tenants];
  }

  getTenantById(id: string): Tenant | undefined {
    return this.tenants.find((tenant) => tenant.id === id);
  }

  getTenantBySubdomain(subdomain: string): Tenant | undefined {
    return this.tenants.find((tenant) => tenant.subdomain === subdomain);
  }

  getTenantsForUser(userTenantIds: string[]): Tenant[] {
    return this.tenants.filter((tenant) => userTenantIds.includes(tenant.id));
  }
}
