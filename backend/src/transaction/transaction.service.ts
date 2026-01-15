import {
  BadRequestException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
}
