import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceLevel, ResourceType } from '@prisma/client';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateResourceDto) {
    return this.prisma.resource.create({
      data: {
        ...dto,
        authorId: userId,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async findAll(query: {
    subject?: string;
    level?: ResourceLevel;
    type?: ResourceType;
    search?: string;
    page?: string;
    limit?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.subject) where.subject = query.subject;
    if (query.level) where.level = query.level;
    if (query.type) where.type = query.type;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { has: query.search } },
      ];
    }

    const [files, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      this.prisma.resource.count({ where }),
    ]);

    return {
      data: files,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        _count: { select: { likes: true, saves: true } },
        comments: {
          include: { author: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!resource) throw new NotFoundException('Resource not found');
    return resource;
  }

  async update(id: string, userId: string, dto: UpdateResourceDto) {
    const resource = await this.findOne(id);
    if (resource.authorId !== userId) throw new ForbiddenException();

    return this.prisma.resource.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string, role: string) {
    const resource = await this.findOne(id);
    if (resource.authorId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    return this.prisma.resource.delete({ where: { id } });
  }

  async toggleLike(id: string, userId: string) {
    const existingLike = await this.prisma.resourceLike.findUnique({
      where: { userId_resourceId: { userId, resourceId: id } },
    });

    if (existingLike) {
      await this.prisma.resourceLike.delete({
        where: { userId_resourceId: { userId, resourceId: id } },
      });
      return { msg: 'unliked' };
    } else {
      await this.prisma.resourceLike.create({
        data: { userId, resourceId: id },
      });
      return { msg: 'liked' };
    }
  }

  async toggleSave(id: string, userId: string) {
    const existingSave = await this.prisma.resourceSave.findUnique({
      where: { userId_resourceId: { userId, resourceId: id } },
    });

    if (existingSave) {
      await this.prisma.resourceSave.delete({
        where: { userId_resourceId: { userId, resourceId: id } },
      });
      return { msg: 'unsaved' };
    } else {
      await this.prisma.resourceSave.create({
        data: { userId, resourceId: id },
      });
      return { msg: 'saved' };
    }
  }

  async getSaved(userId: string) {
    return this.prisma.resourceSave.findMany({
      where: { userId },
      include: {
        resource: {
          include: {
            author: { select: { name: true, avatar: true } },
          },
        },
      },
    });
  }

  async addComment(id: string, userId: string, content: string) {
    return this.prisma.comment.create({
      data: {
        content,
        authorId: userId,
        resourceId: id,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async removeComment(id: string, commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException();
    if (comment.authorId !== userId) throw new ForbiddenException();

    return this.prisma.comment.delete({ where: { id: commentId } });
  }
  
  async getMetadata(url: string) {
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (EduBridge Meta Scraper)' },
        timeout: 5000,
      });
      const $ = cheerio.load(response.data);
      
      const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
      const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      const image = $('meta[property="og:image"]').attr('content') || '';
      
      return { title, description, image, url };
    } catch (error) {
      return { title: '', description: '', image: '', url };
    }
  }
}
