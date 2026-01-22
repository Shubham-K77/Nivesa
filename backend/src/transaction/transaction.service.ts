/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/createTransaction.dto';
type TransactionsArray = {
  transactions: Array<string>;
};
@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}
  //Bulk Delete Function
  async bulkDeleteTransaction(
    userId: string,
    TransactionsArray: TransactionsArray,
  ) {
    try {
      //Finding the user
      const userExists = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!userExists) {
        throw new UnauthorizedException('The provided user is unauthorized!');
      }
      //The Array Will Be Sent From The Frontend
      if (
        !TransactionsArray.transactions ||
        TransactionsArray.transactions.length === 0
      ) {
        throw new BadRequestException(
          'You must define atleast one transaction info!',
        );
      }
      //Using The Transactions
      const transactionInfo = await this.prisma.transaction.findMany({
        where: {
          id: { in: TransactionsArray.transactions },
          userId: userExists.id,
        },
      });
      //Check if transactions were found
      if (transactionInfo.length === 0) {
        throw new BadRequestException(
          'No transactions found or you do not have permission to delete them!',
        );
      }
      //Changing the account balance before deleting:
      const accountBalanceChanges = transactionInfo.reduce(
        (acc, current) => {
          const amountNumber = Number(current.amount);
          const change =
            current.type === 'EXPENSE' ? amountNumber : -amountNumber;
          acc[current.accountId] = (acc[current.accountId] || 0) + change;
          return acc;
        },
        {} as Record<string, number>,
      );
      //Delete the transactions:
      await this.prisma.$transaction(async (txn) => {
        //Delete transactions
        await txn.transaction.deleteMany({
          where: {
            id: { in: TransactionsArray.transactions },
            userId: userExists.id,
          },
        });
        //Update the transactions
        for (const [accountId, balanceChange] of Object.entries(
          accountBalanceChanges,
        )) {
          await txn.account.update({
            where: { id: accountId },
            data: {
              balance: {
                increment: balanceChange,
              },
            },
          });
        }
      });
      // Response
      return {
        message: 'Successfully Deleted!',
        statusCode: 200,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }
  //Create A New Transaction Function
  calculateNextReccuringDate(currentDate, interval) {
    const date = new Date(currentDate);
    switch (interval) {
      case 'DAILY':
        date.setDate(date.getDate() + 1);
        break;
      case 'WEEKLY':
        date.setDate(date.getDate() + 7);
        break;
      case 'MONTHLY':
        date.setDate(date.getMonth() + 1);
        break;
      case 'YEARLY':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date;
  }
  async createNewTransaction(transactionInfo: CreateTransactionDto) {
    try {
      //Arject Rate-Limiting To Amount Of Transactions Created Per Day

      //Check Whether User Or Family Member
      if (
        (!transactionInfo.userId && !transactionInfo.familyMemberId) ||
        (!transactionInfo.userId?.trim() &&
          !transactionInfo.familyMemberId?.trim())
      ) {
        throw new BadRequestException(
          "Must provide a valid authorized user's info",
        );
      }
      //Is A User
      if (transactionInfo.userId) {
        //User Exists
        const userExists = await this.prisma.user.findUnique({
          where: { id: transactionInfo.userId },
        });
        if (!userExists) {
          throw new UnauthorizedException(
            "Provided user doesn't exist in the system",
          );
        }
        //Check If Account Exists
        const accountExists = await this.prisma.account.findUnique({
          where: {
            id: transactionInfo.accountId,
            userId: transactionInfo.userId,
          },
        });
        if (!accountExists) {
          throw new UnauthorizedException(
            "Provided account doesn't exist in the system.",
          );
        }
        //Update The Balance According To Type
        const balanceChange =
          transactionInfo.type === 'EXPENSE'
            ? -transactionInfo.amount
            : transactionInfo.amount;
        const newBalance = accountExists.balance.toNumber() + balanceChange;
        //Create New Transaction And Update Existing Account's Balance
        const newTransaction = await this.prisma.$transaction(async (txn) => {
          const transaction = await txn.transaction.create({
            data: {
              ...transactionInfo,
              nextRecurringDate:
                transactionInfo.isRecurring && transactionInfo.recurringInterval
                  ? this.calculateNextReccuringDate(
                      transactionInfo.date,
                      transactionInfo.recurringInterval,
                    )
                  : null,
            },
          });
          if (!transaction) {
            throw new ServiceUnavailableException(
              'Unable to create a new transaction',
            );
          }
          await txn.account.update({
            where: { id: transactionInfo.accountId },
            data: { balance: newBalance },
          });
          return transaction;
        });
        //Success Message
        return {
          message: 'Successfully Added Transaction',
          statusCode: 201,
          accountId: newTransaction.accountId,
        };
      } else {
        //Is Family Member Exist
        const familyMemberExists = await this.prisma.familyMember.findFirst({
          where: {
            id: transactionInfo.familyMemberId,
            accountId: transactionInfo.accountId,
          },
        });
        if (!familyMemberExists) {
          throw new UnauthorizedException(
            'Family member not found or not associated with this account',
          );
        }
        //Does Account Exist
        const accountExists = await this.prisma.account.findUnique({
          where: { id: transactionInfo.accountId },
        });
        if (!accountExists) {
          throw new UnauthorizedException(
            "Provided account doesn't exist in the system.",
          );
        }
        //Update The Balance According To Type
        const balanceChange =
          transactionInfo.type === 'EXPENSE'
            ? -transactionInfo.amount
            : transactionInfo.amount;
        const newBalance = accountExists.balance.toNumber() + balanceChange;
        //Create New Transaction And Update Existing Account's Balance
        const newTransaction = await this.prisma.$transaction(async (txn) => {
          const transaction = await txn.transaction.create({
            data: {
              ...transactionInfo,
              nextRecurringDate:
                transactionInfo.isRecurring && transactionInfo.recurringInterval
                  ? this.calculateNextReccuringDate(
                      transactionInfo.date,
                      transactionInfo.recurringInterval,
                    )
                  : null,
            },
          });
          if (!transaction) {
            throw new ServiceUnavailableException(
              'Unable to create a new transaction',
            );
          }
          await txn.account.update({
            where: { id: transactionInfo.accountId },
            data: { balance: newBalance },
          });
          return transaction;
        });
        //Success Message
        return {
          message: 'Successfully Added Transaction',
          statusCode: 201,
          accountId: newTransaction.accountId,
        };
      }
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }
}
