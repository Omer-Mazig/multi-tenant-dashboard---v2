// Extend Express Session
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    isAuthenticated?: boolean;
    activeTenants?: Record<
      string,
      {
        lastActivity: Date;
        isActive: boolean;
      }
    >;
  }
}

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this would be hashed
  tenantIds: string[]; // IDs of tenants this user belongs to
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

export interface UserActivity {
  userId: string;
  tenantId: string;
  lastActivity: Date;
}
