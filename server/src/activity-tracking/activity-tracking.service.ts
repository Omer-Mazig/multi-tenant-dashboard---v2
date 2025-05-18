import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { UserActivity } from '../types';

@Injectable()
export class ActivityTrackingService {
  private userActivity: UserActivity[] = [];

  // Idle timeout in milliseconds (20 seconds)
  private readonly idleTimeout = 20 * 1000;

  async recordActivity(
    userId: string,
    tenantId: string,
    timestamp: Date,
  ): Promise<void> {
    // Remove old activity records for this user and tenant
    this.userActivity = this.userActivity.filter(
      (activity) =>
        !(activity.userId === userId && activity.tenantId === tenantId),
    );

    this.userActivity.push({
      userId,
      tenantId,
      lastActivity: timestamp,
    });

    // Clean up old records (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.userActivity = this.userActivity.filter(
      (activity) => activity.lastActivity > oneHourAgo,
    );
  }

  // Get the last activity time for a specific user and tenant
  async getLastActivity(
    userId: string,
    tenantId: string,
  ): Promise<Date | null> {
    const activity = this.userActivity.find(
      (a) => a.userId === userId && a.tenantId === tenantId,
    );

    return activity ? activity.lastActivity : null;
  }

  // Check if a tenant session is still active (not idle)
  async isTenantSessionActive(
    userId: string,
    tenantId: string,
  ): Promise<boolean> {
    const lastActivity = await this.getLastActivity(userId, tenantId);
    const now = new Date();

    if (!lastActivity) {
      // For new sessions, record initial activity and grant grace period
      await this.recordActivity(userId, tenantId, now);
      return true;
    }

    const timeSinceLastActivity = now.getTime() - lastActivity.getTime();
    return timeSinceLastActivity < this.idleTimeout;
  }

  // Check for idle sessions periodically (every 2 seconds)
  @Interval(2000)
  async checkIdleSessions() {
    const now = new Date();

    for (const activity of this.userActivity) {
      const timeSinceLastActivity =
        now.getTime() - activity.lastActivity.getTime();

      if (timeSinceLastActivity >= this.idleTimeout) {
        console.log(
          `User ${activity.userId} is idle in tenant ${activity.tenantId}`,
        );
        // Remove idle activity record
        this.userActivity = this.userActivity.filter(
          (a) =>
            !(a.userId === activity.userId && a.tenantId === activity.tenantId),
        );
      }
    }
  }
}
