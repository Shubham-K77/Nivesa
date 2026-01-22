import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { UserLoginGuard } from 'src/guard/user.login.guard';
import type { Request } from 'express';
import { CreateTransactionDto } from './dto/createTransaction.dto';

type TransactionsArray = {
  transactions: Array<string>;
};

@Controller('transactions')
export class TransactionController {
  //Dependency Injection
  constructor(private readonly transactionService: TransactionService) {}
  //Delete Multiple Or Single Transaction
  @Post('/delete')
  @UseGuards(UserLoginGuard)
  async deleteTransactions(
    @Body() transactionsArray: TransactionsArray,
    @Req() req: Request,
  ) {
    //Get The Current User Id
    const currentUser = req['current_user'];
    const response = await this.transactionService.bulkDeleteTransaction(
      currentUser?.id || '',
      transactionsArray,
    );
    return response;
  }
  //Create New Transaction
  @Post('/')
  @UseGuards(UserLoginGuard)
  async createNewTransaction(@Body() transactionInfo: CreateTransactionDto) {
    const response =
      await this.transactionService.createNewTransaction(transactionInfo);
    return response;
  }
}
