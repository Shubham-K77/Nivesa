/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BudgetService {
  //Dependency Injection
  constructor(private readonly prisma: PrismaService) {}
  //Methods
  async checkAccountAndUser(accountId: string, userId: string) {
    try {
      //Check UserId
      if (!userId || !userId.trim()) {
        throw new UnauthorizedException('Must login to system to continue.');
      }
      //Check If User Account Exists
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExists) {
        throw new UnauthorizedException(
          "The provided user wasn't found in the system!",
        );
      }
      //Check AccountId
      if (!accountId || !accountId.trim()) {
        throw new BadRequestException('Must provide a valid account info!');
      }
      //Check If Account Exists
      const accountExists = await this.prisma.account.findUnique({
        where: {
          id: accountId,
        },
      });
      if (!accountExists) {
        throw new UnauthorizedException(
          "The account info wasn't found in the system.",
        );
      }
      //Return
      return {
        userExists,
        accountExists,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }
  async checkAccountsAndFamilyUser(accountId: string, familyMemberId: string) {
    try {
      //Check UserId
      if (!familyMemberId || !familyMemberId.trim()) {
        throw new UnauthorizedException('Must login to system to continue.');
      }
      //Check If User Account Exists
      const userExists = await this.prisma.familyMember.findFirst({
        where: { id: familyMemberId, accountId: accountId },
      });
      if (!userExists) {
        throw new UnauthorizedException(
          "The provided user wasn't found in the system!",
        );
      }
      //Check AccountId
      if (!accountId || !accountId.trim()) {
        throw new BadRequestException('Must provide a valid account info!');
      }
      //Check If Account Exists
      const accountExists = await this.prisma.account.findUnique({
        where: {
          id: accountId,
        },
      });
      if (!accountExists) {
        throw new UnauthorizedException(
          "The account info wasn't found in the system.",
        );
      }
      //Return
      return {
        userExists,
        accountExists,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }
  async getBudget(
    accountId: string,
    userId: string,
    role: 'USER' | 'FAMILY_MEMBER',
  ) {
    try {
      let userAndAccountInfo;
      if (role === 'USER') {
        userAndAccountInfo = await this.checkAccountAndUser(accountId, userId);
      } else {
        userAndAccountInfo = await this.checkAccountsAndFamilyUser(
          accountId,
          userId,
        );
      }
      //Budget Info
      const budgetInfo = await this.prisma.budget.findUnique({
        where: {
          accountId: userAndAccountInfo.accountExists.id,
        },
      });
      //Monthly Constraints
      const currentDate = new Date();
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      //Expenses
      const expenseWhere =
        role === 'USER'
          ? { userId: userAndAccountInfo.userExists.id }
          : { familyMemberId: userAndAccountInfo.userExists.id };
      const expenses = await this.prisma.transaction.aggregate({
        where: {
          ...expenseWhere,
          accountId: userAndAccountInfo.accountExists.id,
          type: 'EXPENSE',
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
      });
      //Return
      return {
        message: 'Successfully Retrieved!',
        statusCode: 200,
        budget: budgetInfo
          ? { ...budgetInfo, amount: budgetInfo.amount.toNumber() }
          : null,
        currentExpenses: expenses._sum.amount
          ? expenses._sum.amount.toNumber()
          : 0,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error');
    }
  }
  async updateBudget(accountId: string, userId: string, amount: number) {
    try {
      const userAndAccountInfo = await this.checkAccountAndUser(
        accountId,
        userId,
      );
      //Update Existing Or Create New
      const budgetInfo = await this.prisma.budget.upsert({
        where: {
          accountId: userAndAccountInfo.accountExists.id,
        },
        update: {
          amount,
        },
        create: {
          accountId,
          amount,
        },
      });
      //Return Info
      return {
        message: 'Budget Updated Successfully!',
        statusCode: 201,
        budgetInfo: { ...budgetInfo, amount: budgetInfo.amount.toNumber() },
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }
}
