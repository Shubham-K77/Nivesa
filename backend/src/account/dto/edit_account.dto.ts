import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create_account.dto';

export class EditAccountDto extends PartialType(CreateAccountDto) {}
