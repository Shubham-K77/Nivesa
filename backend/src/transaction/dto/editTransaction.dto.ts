import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './createTransaction.dto';

export class EditTransactionDto extends PartialType(CreateTransactionDto) {}
