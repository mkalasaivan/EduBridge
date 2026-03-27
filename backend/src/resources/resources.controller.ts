import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResourceLevel, ResourceType } from '@prisma/client';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: any, @Body() createDto: CreateResourceDto) {
    return this.resourcesService.create(user.id, createDto);
  }

  @Get('preview')
  getPreview(@Query('url') url: string) {
    return this.resourcesService.getMetadata(url);
  }

  @Get()
  findAll(
    @Query('subject') subject?: string,
    @Query('level') level?: ResourceLevel,
    @Query('type') type?: ResourceType,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.resourcesService.findAll({
      subject,
      level,
      type,
      search,
      page,
      limit,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('saved')
  getSaved(@CurrentUser() user: any) {
    return this.resourcesService.getSaved(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateDto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(id, user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.resourcesService.remove(id, user.id, user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  toggleLike(@Param('id') id: string, @CurrentUser() user: any) {
    return this.resourcesService.toggleLike(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/save')
  toggleSave(@Param('id') id: string, @CurrentUser() user: any) {
    return this.resourcesService.toggleSave(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('content') content: string,
  ) {
    return this.resourcesService.addComment(id, user.id, content);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/comments/:commentId')
  removeComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
  ) {
    return this.resourcesService.removeComment(id, commentId, user.id);
  }
}
