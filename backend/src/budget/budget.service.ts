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

      // For FAMILY_MEMBER role, return their family budget instead of account budget
      if (role === 'FAMILY_MEMBER') {
        const familyBudgetInfo = await this.prisma.familyBudget.findUnique({
          where: {
            familyMemberId: userId,
          },
        });

        // Monthly Constraints
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

        // Family member's own expenses only
        const expenses = await this.prisma.transaction.aggregate({
          where: {
            familyMemberId: userId,
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

        return {
          message: 'Successfully Retrieved!',
          statusCode: 200,
          budget: familyBudgetInfo
            ? {
                ...familyBudgetInfo,
                amount: familyBudgetInfo.amount.toNumber(),
              }
            : null,
          currentExpenses: expenses._sum.amount
            ? expenses._sum.amount.toNumber()
            : 0,
          // DO NOT include account balance for family members
        };
      }

      // For USER role, return account budget
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

  // Family Budget Methods
  async getFamilyMembersByAccount(accountId: string, userId: string) {
    try {
      // Verify user owns this account
      const account = await this.prisma.account.findFirst({
        where: {
          id: accountId,
          userId: userId,
        },
        include: {
          familyMembers: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              imageUrl: true,
              isActive: true,
            },
          },
        },
      });

      if (!account) {
        throw new UnauthorizedException(
          'Account not found or you do not have access to it.',
        );
      }

      if (account.type !== 'FAMILY') {
        throw new BadRequestException(
          'This endpoint is only for family accounts.',
        );
      }

      return {
        message: 'Family members retrieved successfully!',
        statusCode: 200,
        familyMembers: account.familyMembers,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }

  async getFamilyBudget(familyMemberId: string, userId: string) {
    try {
      // Verify the family member exists and belongs to user's account
      const familyMember = await this.prisma.familyMember.findFirst({
        where: {
          id: familyMemberId,
          userId: userId,
        },
        include: {
          familyBudget: true,
        },
      });

      if (!familyMember) {
        throw new UnauthorizedException(
          'Family member not found or you do not have access.',
        );
      }

      // Get monthly expenses for this family member
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

      const expenses = await this.prisma.transaction.aggregate({
        where: {
          familyMemberId: familyMemberId,
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

      return {
        message: 'Family budget retrieved successfully!',
        statusCode: 200,
        budget: familyMember.familyBudget
          ? {
              ...familyMember.familyBudget,
              amount: familyMember.familyBudget.amount.toNumber(),
            }
          : null,
        currentExpenses: expenses._sum.amount
          ? expenses._sum.amount.toNumber()
          : 0,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }

  async updateFamilyBudget(
    familyMemberId: string,
    userId: string,
    amount: number,
  ) {
    try {
      // Verify the family member exists and belongs to user's account
      const familyMember = await this.prisma.familyMember.findFirst({
        where: {
          id: familyMemberId,
          userId: userId,
        },
        include: {
          account: true,
        },
      });

      if (!familyMember) {
        throw new UnauthorizedException(
          'Family member not found or you do not have access.',
        );
      }

      // Verify this is a FAMILY account
      if (familyMember.account.type !== 'FAMILY') {
        throw new BadRequestException(
          'Family budgets can only be set for family accounts.',
        );
      }

      // Verify the budget doesn't exceed the actual account balance
      const accountBalance = familyMember.account.balance.toNumber();
      if (amount > accountBalance) {
        throw new BadRequestException(
          `Budget amount (${amount}) cannot exceed the family account balance (${accountBalance}).`,
        );
      }

      // Get all family budgets for this account to ensure total doesn't exceed balance
      const allFamilyBudgets = await this.prisma.familyBudget.findMany({
        where: {
          familyMember: {
            accountId: familyMember.accountId,
          },
          familyMemberId: {
            not: familyMemberId, // Exclude current family member
          },
        },
      });

      const totalOtherBudgets = allFamilyBudgets.reduce(
        (sum, budget) => sum + budget.amount.toNumber(),
        0,
      );

      const totalBudgetsAfterUpdate = totalOtherBudgets + amount;

      if (totalBudgetsAfterUpdate > accountBalance) {
        throw new BadRequestException(
          `Total family budgets (${totalBudgetsAfterUpdate}) cannot exceed the family account balance (${accountBalance}). Other family members have budgets totaling ${totalOtherBudgets}.`,
        );
      }

      // Upsert the family budget
      const familyBudget = await this.prisma.familyBudget.upsert({
        where: {
          familyMemberId: familyMemberId,
        },
        update: {
          amount,
        },
        create: {
          familyMemberId,
          amount,
        },
      });

      return {
        message: 'Family budget updated successfully!',
        statusCode: 201,
        budgetInfo: {
          ...familyBudget,
          amount: familyBudget.amount.toNumber(),
        },
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }
}
