import { Module, forwardRef } from '@nestjs/common';
import { ActivityTrackingService } from './activity-tracking.service';
import { ActivityTrackingController } from './activity-tracking.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [ActivityTrackingService],
  controllers: [ActivityTrackingController],
  exports: [ActivityTrackingService],
})
export class ActivityTrackingModule {}
