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
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ArcjetService } from '../arcjet/arcjet.service';
import { UserLoginGuard } from 'src/guard/user.login.guard';
import type { Request } from 'express';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { EditTransactionDto } from './dto/editTransaction.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
type TransactionsArray = {
  transactions: Array<string>;
};
@Controller('transactions')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);
  constructor(
    private readonly transactionService: TransactionService,
    private readonly arcjetService: ArcjetService,
    private readonly httpService: HttpService,
  ) {}
  @Get('/dashboard')
  @UseGuards(UserLoginGuard)
  async getDashboardData(@Req() req: Request) {
    const currentUser = req['current_user'];
    const userId = currentUser?.id || '';
    const role = currentUser?.role;
    const response = await this.transactionService.getDashboardData(
      userId,
      role,
    );
    return response;
  }

  @Post('/predict')
  @UseGuards(UserLoginGuard)
  async predictSpending(@Body() body: any) {
    try {
      // Forward request to Python FastAPI service
      const pythonApiUrl =
        process.env.PYTHON_API_URL || 'http://localhost:8000';
      const response: AxiosResponse<Record<string, unknown>> =
        await firstValueFrom(
          this.httpService.post(`${pythonApiUrl}/predict`, body, {
            headers: {
              'Content-Type': 'application/json',
            },
          }),
        );
      return response.data;
    } catch (error: any) {
      this.logger.error('Prediction API error:', error.response?.data || error);
      throw new HttpException(
        (error.response?.data?.detail as string) ||
          'Failed to generate forecast',
        (error.response?.status as number) || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/:id')
  @UseGuards(UserLoginGuard)
  async getSpecificTransaction(@Param('id') id: string, @Req() req: Request) {
    const currentUser = req['current_user'];
    const userId = currentUser?.id || '';
    const role = currentUser?.role;
    const response = await this.transactionService.getSpecificTransaction(
      id,
      userId,
      role,
    );
    return response;
  }

  @Post('/delete')
  @UseGuards(UserLoginGuard)
  async deleteTransactions(
    @Body() transactionsArray: TransactionsArray,
    @Req() req: Request,
  ) {
    const currentUser = req['current_user'];
    const role = currentUser?.role;
    const response = await this.transactionService.bulkDeleteTransaction(
      currentUser?.id || '',
      transactionsArray,
      role,
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
        if (decision.reason.isShield()) {
          this.logger.warn(
            `Shield blocked suspicious request from user ${userId}`,
          );
          throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
        if (decision.reason.isBot()) {
          this.logger.warn(`Bot detected and blocked for user ${userId}`);
          throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
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

  @Post('/scan')
  @UseGuards(UserLoginGuard)
  @UseInterceptors(FileInterceptor('receipt'))
  async scanReceipts(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const response = await this.transactionService.scanReceipt(file);
    return response;
  }

  @Patch('/:id')
  @UseGuards(UserLoginGuard)
  async updateSpecificTransaction(
    @Param('id') id: string,
    @Body() transactionData: EditTransactionDto,
    @Req() req: Request,
  ) {
    const currentUser = req['current_user'];
    const role = currentUser?.role;
    const response = await this.transactionService.updateExistingTransaction(
      id,
      transactionData,
      currentUser?.id || '',
      role,
    );
    return response;
  }

  @Get('/forecast-data/all')
  @UseGuards(UserLoginGuard)
  async getForecastData(@Req() req: Request) {
    const currentUser = req['current_user'];
    const userId = currentUser?.id || '';
    const role = currentUser?.role;
    const response = await this.transactionService.getForecastData(
      userId,
      role,
    );
    return response;
  }
}
