import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailingService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailingService.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: Number(this.config.get('SMTP_PORT')),
      secure: this.config.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendOtp(email: string, otp: string) {
    const mailOptions = {
      from: `"EduBridge" <${this.config.get('SMTP_FROM')}>`,
      to: email,
      subject: 'Verify Your EduBridge Account',
      html: `
        <div style="font-family: 'Inter', sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #6366f1;">Welcome to EduBridge!</h1>
          <p>Please use the following OTP to verify your registration:</p>
          <div style="font-size: 32px; font-weight: 800; color: #6366f1; padding: 20px; background: #f0f4ff; border-radius: 12px; display: inline-block; margin: 10px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP sent to ${email}`);
    } catch (error) {
      this.logger.error(`Error sending OTP to ${email}:`, error);
      // Fallback for development if SMTP is not configured
      this.logger.warn(`[DEVELOPMENT ONLY] OTP for ${email} is: ${otp}`);
    }
  }

  async sendSessionScheduled(email: string, mentorName: string, startTime: Date, endTime: Date) {
    const startStr = startTime.toLocaleString();
    const endStr = endTime.toLocaleString();

    const mailOptions = {
      from: `"EduBridge" <${this.config.get('SMTP_FROM')}>`,
      to: email,
      subject: 'Mentorship Session Scheduled!',
      html: `
        <div style="font-family: 'Inter', sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #6366f1;">New Session Scheduled!</h1>
          <p>Your mentor, <strong>${mentorName}</strong>, has scheduled a session for you.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="margin: 0; font-weight: 700; color: #64748b;">START TIME</p>
            <p style="margin: 5px 0 15px; font-size: 18px; font-weight: 800;">${startStr}</p>
            
            <p style="margin: 0; font-weight: 700; color: #64748b;">END TIME</p>
            <p style="margin: 5px 0; font-size: 18px; font-weight: 800;">${endStr}</p>
          </div>
          <p>The event has been added to your Google Calendar.</p>
          <a href="${this.config.get('FRONTEND_URL')}/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; margin-top: 10px;">View Dashboard</a>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Session notification sent to ${email}`);
    } catch (error) {
      this.logger.error(`Error sending session notification to ${email}:`, error);
    }
  }
}
