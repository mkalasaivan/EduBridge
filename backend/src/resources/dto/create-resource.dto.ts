import {
  IsString,
  IsEnum,
  IsOptional,
  IsUrl,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { ResourceType, ResourceLevel } from '@prisma/client';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ResourceType)
  type: ResourceType;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsEnum(ResourceLevel)
  level: ResourceLevel;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
