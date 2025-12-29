import { Controller } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transactions')
export class TransactionController {
  //Dependency Injection
  constructor(private readonly transactionService: TransactionService) {}
}
