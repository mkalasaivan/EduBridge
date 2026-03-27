import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { MailingService } from '../common/mailing/mailing.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailing: MailingService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
        isVerified: false,
      },
    });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await this.prisma.otp.create({
      data: {
        code: otpCode,
        email: user.email,
        expiresAt,
        userId: user.id,
      },
    });

    await this.mailing.sendOtp(user.email, otpCode);

    return { 
      message: 'Verification code sent to your email',
      email: user.email,
      requiresVerification: true 
    };
  }

  async verifyOtp(email: string, code: string) {
    const otp = await this.prisma.otp.findFirst({
      where: { email, code },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const user = await this.prisma.user.update({
      where: { id: otp.userId },
      data: { isVerified: true },
    });

    // Delete used OTP
    await this.prisma.otp.delete({ where: { id: otp.id } });

    return this.generateTokens(user);
  }

  async resendOtp(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new BadRequestException('User not found');
    if (user.isVerified) throw new BadRequestException('User already verified');

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.otp.create({
      data: {
        code: otpCode,
        email: user.email,
        expiresAt,
        userId: user.id,
      },
    });

    await this.mailing.sendOtp(user.email, otpCode);

    return { message: 'New verification code sent' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified. Please verify your account.');
    }

    return this.generateTokens(user);
  }

  async findOrCreateGoogleUser(data: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
    accessToken?: string;
    refreshToken?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: data.googleId },
    });

    let isNew = false;
    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { 
            googleId: data.googleId, 
            avatar: data.avatar,
            isVerified: true, // Google users are verified automatically
            googleAccessToken: data.accessToken,
            googleRefreshToken: data.refreshToken,
          },
        });
      } else {
        isNew = true;
        user = await this.prisma.user.create({
          data: {
            googleId: data.googleId,
            email: data.email,
            name: data.name,
            avatar: data.avatar,
            role: 'STUDENT',
            isVerified: true,
            googleAccessToken: data.accessToken,
            googleRefreshToken: data.refreshToken,
          },
        });
      }
    } else {
      // Update tokens if they exist
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleAccessToken: data.accessToken || user.googleAccessToken,
          googleRefreshToken: data.refreshToken || user.googleRefreshToken,
        }
      });
    }

    return { user, isNew };
  }

  generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
    });

    const { passwordHash: _, googleAccessToken: __, googleRefreshToken: ___, ...safeUser } = user;
    return { accessToken, refreshToken, user: safeUser };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) throw new UnauthorizedException();
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
