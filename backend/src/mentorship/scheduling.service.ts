import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  private async getOAuth2Client(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { googleAccessToken: true, googleRefreshToken: true },
    });

    if (!user?.googleAccessToken || !user?.googleRefreshToken) {
      throw new BadRequestException('Mentor has not linked a Google account with appropriate permissions.');
    }

    const oauth2Client = new google.auth.OAuth2(
      this.config.get('GOOGLE_CLIENT_ID'),
      this.config.get('GOOGLE_CLIENT_SECRET'),
      this.config.get('GOOGLE_CALLBACK_URL'),
    );

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    // Listen for new tokens and update user record
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { googleAccessToken: tokens.access_token },
        });
        this.logger.log(`Refreshed Google access token for user ${userId}`);
      }
    });

    return oauth2Client;
  }

  async createCalendarEvent(
    mentorId: string,
    studentEmail: string,
    subject: string,
    startTime: Date,
    endTime: Date,
  ) {
    const auth = await this.getOAuth2Client(mentorId);
    const calendar = google.calendar({ version: 'v3', auth });

    try {
      const event = await calendar.events.insert({
        calendarId: 'primary',
        sendUpdates: 'all',
        conferenceDataVersion: 1,
        requestBody: {
          summary: `EduBridge Mentorship: ${subject}`,
          description: `Scheduled mentorship session via EduBridge platform.`,
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
          attendees: [{ email: studentEmail }],
          reminders: {
            useDefault: true,
          },
          conferenceData: {
            createRequest: {
              requestId: `edubridge-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
      });

      return event.data.id;
    } catch (error) {
      this.logger.error(`Error creating Google Calendar event for mentor ${mentorId}:`, error);
      throw new BadRequestException('Failed to create calendar event. Please verify your calendar permissions.');
    }
  }
}
