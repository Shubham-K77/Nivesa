/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  UseGuards,
  Req,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ArcjetService } from '../arcjet/arcjet.service';
import { UserLoginGuard } from 'src/guard/user.login.guard';
import type { Request } from 'express';
import { CreateTransactionDto } from './dto/createTransaction.dto';
type TransactionsArray = {
  transactions: Array<string>;
};
@Controller('transactions')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);
  constructor(
    private readonly transactionService: TransactionService,
    private readonly arcjetService: ArcjetService,
  ) {}
  @Post('/delete')
  @UseGuards(UserLoginGuard)
  async deleteTransactions(
    @Body() transactionsArray: TransactionsArray,
    @Req() req: Request,
  ) {
    const currentUser = req['current_user'];
    const response = await this.transactionService.bulkDeleteTransaction(
      currentUser?.id || '',
      transactionsArray,
    );
    return response;
  }
  @Post('/')
  @UseGuards(UserLoginGuard)
  async createNewTransaction(
    @Body() transactionInfo: CreateTransactionDto,
    @Req() req: Request,
  ) {
    if (!this.arcjetService.isInitialized()) {
      this.logger.error('Arcjet not initialized');
      throw new HttpException(
        'Service temporarily unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    const current_user = req['current_user'];
    const userId = current_user?.id || '';
    try {
      const decision = await this.arcjetService.protect(req, {
        userId,
        requested: 1,
      });
      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          const { remaining, reset } = decision.reason;
          this.logger.warn({
            code: 'RATE_LIMIT_EXCEEDED',
            userId,
            details: { remaining, resetInSeconds: reset },
          });
          throw new HttpException(
            {
              statusCode: HttpStatus.TOO_MANY_REQUESTS,
              message: 'Too many requests. Please try again later.',
              resetInSeconds: reset,
              remaining,
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        this.logger.warn(
          `Request blocked for user ${userId}:`,
          decision.reason,
        );
        throw new HttpException('Request blocked', HttpStatus.FORBIDDEN);
      }
      const response =
        await this.transactionService.createNewTransaction(transactionInfo);
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Arcjet protection error:', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
