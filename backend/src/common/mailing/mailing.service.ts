import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailingService {
  private resend: Resend;
  private readonly logger = new Logger(MailingService.name);

  constructor(private config: ConfigService) {
    // Initialize Resend with the API key from environment variables
    this.resend = new Resend(this.config.get('RESEND_API_KEY'));
  }

  // Helper method to determine the 'from' address
  // Resend requires you to use onboarding@resend.dev until you verify a custom domain
  private getFromAddress(): string {
    return this.config.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
  }

  async sendOtp(email: string, otp: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.getFromAddress(),
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
      });

      if (error) {
        throw new Error(error.message);
      }
      
      this.logger.log(`OTP sent to ${email} via Resend. ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error sending OTP to ${email}:`, error);
      this.logger.warn(`[DEVELOPMENT ONLY] OTP for ${email} is: ${otp}`);
    }
  }

  async sendSessionScheduled(email: string, mentorName: string, startTime: Date, endTime: Date) {
    const startStr = startTime.toLocaleString();
    const endStr = endTime.toLocaleString();

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.getFromAddress(),
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
      });

      if (error) throw new Error(error.message);
      this.logger.log(`Session notification sent to ${email}. ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error sending session notification to ${email}:`, error);
      this.logger.warn(`[DEVELOPMENT ONLY] Mentorship session scheduled email to ${email} would have been sent.`);
    }
  }

  async sendMentorshipRequest(mentorEmail: string, studentName: string, message: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.getFromAddress(),
        to: mentorEmail,
        subject: 'New Mentorship Request! 🎓',
        html: `
          <div style="font-family: 'Inter', sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">You have a new mentorship request!</h1>
            <p><strong>${studentName}</strong> has requested you as a mentor on EduBridge.</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="margin: 0; font-weight: 700; color: #64748b;">MESSAGE</p>
              <p style="margin: 5px 0 0; font-size: 16px; font-style: italic;">"${message}"</p>
            </div>
            <p>Log in to your dashboard to accept or decline the request.</p>
            <a href="${this.config.get('FRONTEND_URL')}/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; margin-top: 10px;">Go to Dashboard</a>
          </div>
        `,
      });

      if (error) throw new Error(error.message);
      this.logger.log(`Mentorship request notification sent to ${mentorEmail}. ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error sending request notification to ${mentorEmail}:`, error);
      this.logger.warn(`[DEVELOPMENT ONLY] Mentorship request email to ${mentorEmail} would have been sent.`);
    }
  }

  async sendMentorshipStatusUpdate(studentEmail: string, mentorName: string, status: string) {
    const isAccepted = status === 'ACCEPTED';
    const color = isAccepted ? '#10b981' : '#ef4444';
    const statusText = isAccepted ? 'Approved! 🎉' : 'Declined';
    
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.getFromAddress(),
        to: studentEmail,
        subject: `Mentorship Request ${statusText}`,
        html: `
          <div style="font-family: 'Inter', sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: ${color};">Mentorship Request ${statusText}</h1>
            <p>Your recent mentorship request to <strong>${mentorName}</strong> has been <strong>${status.toLowerCase()}</strong>.</p>
            ${isAccepted ? '<p>Your mentor will schedule a Google Calendar session with you soon!</p>' : '<p>Keep exploring EduBridge to find other amazing mentors who match your learning path.</p>'}
            <a href="${this.config.get('FRONTEND_URL')}/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; margin-top: 20px;">View Dashboard</a>
          </div>
        `,
      });

      if (error) throw new Error(error.message);
      this.logger.log(`Status update notification sent to ${studentEmail}. ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error sending status notification to ${studentEmail}:`, error);
      this.logger.warn(`[DEVELOPMENT ONLY] Status update email to ${studentEmail} would have been sent.`);
    }
  }
}
