import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString({ message: 'Name must be a string.' })
  @Matches(/^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/, {
    message:
      'Full name can only contain letters, spaces, apostrophes, or hyphens.',
  })
  @MinLength(4, { message: 'Name must be at least 4 characters long.' })
  @IsNotEmpty({ message: 'Name cannot be empty.' })
  name: string;
  @IsString({ message: 'PhoneNumber must be a string. ' })
  @Matches(/^\+977\d{10}$/, {
    message:
      'Please enter a valid Nepali phone number starting with +977 followed by exactly 10 digits.',
  })
  @IsOptional()
  phoneNumber: string;
  @IsString({ message: 'Password must be a string.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  @IsStrongPassword()
  password: string;
  @IsString()
  @IsOptional()
  imageUrl?: string;
  otp: string;
}
