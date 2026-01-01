import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create_user.dto';
import {
  IsOptional,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  newPassword?: string; // This becomes new password

  @IsString()
  @MinLength(8)
  @IsStrongPassword()
  @IsOptional()
  password?: string; // For Password Verification

  @IsString()
  @IsOptional()
  profilePic?: string; // Base64 encoded image
}
