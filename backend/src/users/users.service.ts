import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        resources: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async getMentors(query?: string) {
    const mentors = await this.prisma.user.findMany({
      where: {
        role: Role.MENTOR,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { skills: { has: query } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        skills: true,
        _count: {
          select: { receivedRequests: { where: { status: 'COMPLETED' } } },
        },
      },
    });
    return mentors;
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        skills: true,
        interests: true,
        role: true,
        resources: {
          select: {
            id: true,
            title: true,
            type: true,
            level: true,
            tags: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
