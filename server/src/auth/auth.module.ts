import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { TenantModule } from '../tenant/tenant.module';
import { ActivityTrackingModule } from '../activity-tracking/activity-tracking.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [UserModule, TenantModule, forwardRef(() => ActivityTrackingModule)],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
