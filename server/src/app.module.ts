import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { UserModule } from './user/user.module';
import { ActivityTrackingModule } from './activity-tracking/activity-tracking.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    TenantModule,
    UserModule,
    ActivityTrackingModule,
  ],
})
export class AppModule {}
