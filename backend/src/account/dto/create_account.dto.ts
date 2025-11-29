import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

import { AccountType } from '../../../generated/prisma/enums';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEnum(AccountType)
  @IsNotEmpty()
  type: AccountType;
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Balance must be a valid decimal number with a maximum of two decimal places.',
    },
  )
  @IsOptional()
  balance: number;
  @IsBoolean()
  @IsOptional()
  isDefault: boolean;
  @IsString()
  @IsNotEmpty()
  userId: string;
}
