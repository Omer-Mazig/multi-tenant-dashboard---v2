import { Injectable } from '@nestjs/common';
import { User } from '../types';

@Injectable()
export class UserService {
  // In-memory user storage
  private users: User[] = [
    {
      id: '1',
      username: 'user1',
      password: 'password1',
      tenantIds: ['1'],
    },
    {
      id: '2',
      username: 'user2',
      password: 'password2',
      tenantIds: ['2'],
    },
    {
      id: '3',
      username: 'admin',
      password: 'admin123',
      tenantIds: ['1', '2', '3'],
    },
  ];

  findByUsername(username: string): User | undefined {
    return this.users.find((user) => user.username === username);
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  getUserTenants(userId: string): string[] {
    const user = this.findById(userId);
    return user ? user.tenantIds : [];
  }

  isUserInTenant(userId: string, tenantId: string): boolean {
    const user = this.findById(userId);
    return user ? user.tenantIds.includes(tenantId) : false;
  }
}
