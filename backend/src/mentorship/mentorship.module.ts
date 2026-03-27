import { Module } from '@nestjs/common';
import { MentorshipService } from './mentorship.service';
import { MentorshipController } from './mentorship.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SchedulingService } from './scheduling.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [MentorshipController],
  providers: [MentorshipService, SchedulingService],
})
export class MentorshipModule {}
