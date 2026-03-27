import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMentorshipRequestDto } from './dto/create-mentorship-request.dto';
import { RequestStatus, Role } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';
import { SchedulingService } from './scheduling.service';
import { MailingService } from '../common/mailing/mailing.service';

@Injectable()
export class MentorshipService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private events: EventsGateway,
    private scheduling: SchedulingService,
    private mailing: MailingService,
  ) {}

  async createRequest(studentId: string, dto: CreateMentorshipRequestDto) {
    const mentor = await this.prisma.user.findUnique({
      where: { id: dto.mentorId },
    });

    if (!mentor || mentor.role !== Role.MENTOR) {
      throw new BadRequestException('Invalid mentor ID');
    }

    if (studentId === dto.mentorId) {
      throw new BadRequestException('You cannot request mentorship from yourself');
    }

    const request = await this.prisma.mentorshipRequest.create({
      data: {
        subject: dto.subject,
        message: dto.message,
        studentId,
        mentorId: dto.mentorId,
      },
      include: {
        mentor: { select: { id: true, name: true, avatar: true } },
        student: { select: { name: true } },
      },
    });

    // Notify Mentor
    await this.notifications.create(dto.mentorId, {
      title: 'New Mentorship Request',
      content: `${request.student.name} requested mentorship on "${dto.subject}"`,
      type: 'MENTORSHIP_REQUEST',
      link: `/mentorship/${request.id}`,
    });

    // Real-time notification
    this.events.emitNotification(dto.mentorId, {
      title: 'New Mentorship Request',
      content: `${request.student.name} requested mentorship on "${dto.subject}"`,
      type: 'MENTORSHIP_REQUEST',
    });

    return request;
  }

  async getRequests(userId: string, role: Role) {
    return this.prisma.mentorshipRequest.findMany({
      where: role === Role.STUDENT ? { studentId: userId } : { mentorId: userId },
      include: {
        student: { select: { id: true, name: true, avatar: true } },
        mentor: { select: { id: true, name: true, avatar: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRequestById(requestId: string, userId: string) {
    const request = await this.prisma.mentorshipRequest.findUnique({
      where: { id: requestId },
      include: {
        student: { select: { id: true, name: true, avatar: true } },
        mentor: { select: { id: true, name: true, avatar: true } },
        messages: {
          include: { sender: { select: { id: true, name: true, avatar: true } } },
          orderBy: { sentAt: 'asc' },
        },
      },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.studentId !== userId && request.mentorId !== userId) {
      throw new ForbiddenException();
    }

    return request;
  }

  async updateStatus(requestId: string, mentorId: string, status: RequestStatus) {
    const request = await this.prisma.mentorshipRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.mentorId !== mentorId) throw new ForbiddenException();

    const updated = await this.prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: { status },
      include: {
        mentor: { select: { name: true } },
        student: { select: { id: true } },
      },
    });

    // Notify Student
    await this.notifications.create(updated.studentId, {
      title: `Request ${status.toLowerCase()}`,
      content: `${updated.mentor.name} has ${status.toLowerCase()} your mentorship request.`,
      type: 'MENTORSHIP_STATUS',
      link: `/mentorship/${requestId}`,
    });

    // Real-time notification
    this.events.emitNotification(updated.studentId, {
      title: `Request ${status.toLowerCase()}`,
      content: `${updated.mentor.name} has ${status.toLowerCase()} your mentorship request.`,
      type: 'MENTORSHIP_STATUS',
    });

    return updated;
  }

  async sendMessage(requestId: string, senderId: string, content: string) {
    const request = await this.prisma.mentorshipRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.studentId !== senderId && request.mentorId !== senderId) {
      throw new ForbiddenException();
    }

    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        requestId,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Notify Recipient
    const recipientId = request.studentId === senderId ? request.mentorId : request.studentId;
    await this.notifications.create(recipientId, {
      title: 'New Message',
      content: `New message from ${message.sender.name}`,
      type: 'NEW_MESSAGE',
      link: `/mentorship/${requestId}`,
    });

    // Real-time message & Notification
    this.events.emitMessage(requestId, message);
    this.events.emitNotification(recipientId, {
      title: 'New Message',
      content: `New message from ${message.sender.name}`,
      type: 'NEW_MESSAGE',
    });

    return message;
  }

  async scheduleSession(mentorId: string, requestId: string, startTime: Date, endTime: Date) {
    const request = await this.prisma.mentorshipRequest.findUnique({
      where: { id: requestId },
      include: { 
        student: { select: { email: true, id: true, name: true } },
        mentor: { select: { id: true, name: true } }
      },
    });

    if (!request) throw new NotFoundException('Mentorship request not found');
    if (request.mentorId !== mentorId) throw new ForbiddenException();
    if (request.status !== RequestStatus.ACCEPTED) {
      throw new BadRequestException('Can only schedule sessions for accepted requests');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Start time cannot be in the past');
    }

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Create session in Prisma
    const session = await this.prisma.mentorshipSession.create({
      data: {
        startTime,
        endTime,
        requestId,
      },
    });

    // Create Google Calendar event
    let googleEventId: string | undefined;
    try {
      googleEventId = await this.scheduling.createCalendarEvent(
        mentorId,
        request.student.email,
        request.subject,
        startTime,
        endTime,
      ) ?? undefined;

      if (googleEventId) {
        await this.prisma.mentorshipSession.update({
          where: { id: session.id },
          data: { googleEventId },
        });
      }
    } catch (error) {
      console.error('Google Calendar event creation failed:', error);
    }

    // Notify Student (In-app)
    await this.notifications.create(request.student.id, {
      title: 'Mentorship Session Scheduled',
      content: `${request.mentor.name} scheduled a session for your "${request.subject}" mentorship on ${startTime.toLocaleString()}`,
      type: 'SESSION_SCHEDULED',
      link: `/mentorship/${requestId}`,
    });

    // Real-time notification
    this.events.emitNotification(request.student.id, {
      title: 'Mentorship Session Scheduled',
      content: `${request.mentor.name} scheduled a session for your "${request.subject}" mentorship.`,
      type: 'SESSION_SCHEDULED',
    });

    // Email Notification
    await this.mailing.sendSessionScheduled(
      request.student.email,
      request.mentor.name,
      startTime,
      endTime,
    );

    return session;
  }

  async getSessions(userId: string, role: Role) {
    return this.prisma.mentorshipSession.findMany({
      where: role === Role.STUDENT 
        ? { request: { studentId: userId } } 
        : { request: { mentorId: userId } },
      include: {
        request: {
          include: {
            student: { select: { id: true, name: true, avatar: true } },
            mentor: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }
}
