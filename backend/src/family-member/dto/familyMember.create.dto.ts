import {
  IsString,
  IsEmail,
  IsOptional,
  IsStrongPassword,
  Matches,
  IsBoolean,
  IsNotEmpty,
  IsDate,
} from 'class-validator';

export class FamilyMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string; //Optional field but required for login
  @IsString()
  @IsStrongPassword()
  @IsOptional()
  password?: string; //Optional field during the creation
  @IsString()
  @Matches(/^\+977\d{10}$/, {
    message:
      'Please enter a valid Nepali phone number starting with +977 followed by exactly 10 digits.',
  })
  @IsOptional()
  phoneNumber?: string; //Optional field only for whatsapp notifications
  @IsString()
  @IsOptional()
  invitationToken?: string;
  @IsDate()
  @IsOptional()
  invitationExpiry?: Date;
  @IsString()
  @IsOptional()
  accountId: string;
  @IsString()
  @IsOptional()
  userId: string;
  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
