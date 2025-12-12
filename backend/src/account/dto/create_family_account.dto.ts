import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FamilyMemberDto } from 'src/family-member/dto/familyMember.create.dto';
import { AccountType } from '../../../generated/prisma/enums';

export class createFamilyAccountDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FamilyMemberDto)
  @IsNotEmpty()
  familyMemberInfo: FamilyMemberDto[];
}
