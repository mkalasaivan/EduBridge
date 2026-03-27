import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MentorshipService } from './mentorship.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMentorshipRequestDto } from './dto/create-mentorship-request.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestStatus, Role, User } from '@prisma/client';

@Controller('mentorship')
@UseGuards(JwtAuthGuard)
export class MentorshipController {
  constructor(private readonly mentorshipService: MentorshipService) {}

  @Post()
  createRequest(
    @CurrentUser() user: User,
    @Body() dto: CreateMentorshipRequestDto,
  ) {
    return this.mentorshipService.createRequest(user.id, dto);
  }

  @Get()
  getRequests(@CurrentUser() user: User) {
    return this.mentorshipService.getRequests(user.id, user.role);
  }

  @Get(':id')
  getRequestById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.mentorshipService.getRequestById(id, user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('status') status: RequestStatus,
  ) {
    return this.mentorshipService.updateStatus(id, user.id, status);
  }

  @Post(':id/schedule')
  scheduleSession(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
  ) {
    return this.mentorshipService.scheduleSession(
      user.id,
      id,
      new Date(startTime),
      new Date(endTime),
    );
  }

  @Get('sessions/all')
  getSessions(@CurrentUser() user: User) {
    return this.mentorshipService.getSessions(user.id, user.role);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('content') content: string,
  ) {
    return this.mentorshipService.sendMessage(id, user.id, content);
  }
}
