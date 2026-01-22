import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TransactionType,
  TransactionCategory,
  RecurringInterval,
  TransactionStatus,
} from '../../../generated/prisma/enums';
export class CreateTransactionDto {
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;
  @IsString()
  @IsOptional()
  userId?: string;
  @IsNumber()
  @IsNotEmpty()
  amount: number;
  @IsString()
  @IsNotEmpty()
  accountId: string;
  @IsString()
  @IsOptional()
  familyMemberId?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date: Date;
  @IsEnum(TransactionCategory)
  category: TransactionCategory;
  @IsString()
  @IsOptional()
  receiptUrl?: string;
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;
  @IsEnum(RecurringInterval)
  @IsOptional()
  recurringInterval?: RecurringInterval;
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  nextRecurringDate: Date;
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  lastProcessed: Date;
  @IsEnum(TransactionStatus)
  @IsOptional()
  status: TransactionStatus;
}
