import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMentorshipRequestDto {
  @IsString()
  @IsNotEmpty()
  mentorId: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
