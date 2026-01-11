/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAccountDto } from './dto/create_account.dto';
import { createFamilyAccountDto } from './dto/create_family_account.dto';
import { FamilyMemberService } from 'src/family-member/family-member.service';
import { FamilyMemberDto } from 'src/family-member/dto/familyMember.create.dto';
@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly familyMemberService: FamilyMemberService,
  ) {}
  //Get Request
  async getUserAccounts(userId: string) {
    try {
      if (!userId || !userId.trim()) {
        throw new UnauthorizedException('Missing user info!');
      }
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExists) {
        throw new UnauthorizedException(
          'The provided user was not found in the system.',
        );
      }
      //Getting the three latest account info:
      const accountInfo = await this.prisma.account.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          transactions: true,
          familyMembers: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              accountId: true,
              userId: true,
              isActive: true,
            },
          },
        },
        take: 3,
      });
      if (!accountInfo || accountInfo.length < 0) {
        throw new NotFoundException('There was no account info!');
      }
      //Return The Data:
      return {
        message: 'Successfully Retrieved Account Info!',
        statusCode: 200,
        accountInfo,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error');
    }
  }
  async getUserEveryAccounts(userId: string) {
    try {
      if (!userId || !userId.trim()) {
        throw new BadRequestException("Must provide the loggedIn user's info.");
      }
      //Find the user first
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExists) {
        throw new UnauthorizedException(
          "The provided user wasn't found on the system.",
        );
      }
      //Get The Account Info
      const accountInfo = await this.prisma.account.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          transactions: true,
          familyMembers: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              accountId: true,
              userId: true,
              isActive: true,
            },
          },
        },
      });
      if (!accountInfo) {
        throw new ServiceUnavailableException(
          'Unable to retrieve the information, at this moment. Try Again!',
        );
      }
      //Return
      return {
        statusCode: 200,
        message: 'Successfully retrieved the accounts.',
        accountInfo,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }
  async getAccount(userId: string, accountId: string) {
    try {
      //Check The Parameters:
      if (!userId || !userId.trim()) {
        throw new BadRequestException("Must provide the loggedIn user's info.");
      }
      if (!accountId || !accountId.trim()) {
        throw new BadRequestException("Must provide the account's info.");
      }
      //Check For User
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExists) {
        throw new UnauthorizedException("The provided user doesn't exist.");
      }
      //Get The Account
      const accountInfo = await this.prisma.account.findUnique({
        where: { userId, id: accountId },
        include: {
          transactions: true,
          familyMembers: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              accountId: true,
              userId: true,
              isActive: true,
            },
          },
        },
      });
      if (!accountInfo) {
        throw new ServiceUnavailableException(
          'Unable to retrieve at the moment. Please, try again!',
        );
      }
      //Response
      return {
        statusCode: 200,
        message: "Successfully retrieved the account's info.",
        accountInfo,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }
  //Post Request
  async createAccount(newAccountInfo: CreateAccountDto) {
    try {
      const userExists = await this.prisma.user.findUnique({
        where: { id: newAccountInfo.userId },
      });
      if (!userExists) {
        throw new UnauthorizedException("The user wasn't found in the system.");
      }
      //Default Account: Only one account can be set as a default account at a time
      const multipleAccountsExists = await this.prisma.account.findMany({
        where: { userId: newAccountInfo.userId },
      });
      if (multipleAccountsExists.length === 0) {
        //If there are no accounts automatically default
        newAccountInfo.isDefault = true;
      } else {
        //If there are other accounts and the user had made this account default
        if (newAccountInfo.isDefault === true) {
          await this.prisma.account.updateMany({
            where: { userId: newAccountInfo.userId },
            data: { isDefault: false },
          });
        }
      }
      //Create New Account
      const newAccount = await this.prisma.account.create({
        data: newAccountInfo,
      });
      if (!newAccount) {
        throw new ServiceUnavailableException(
          'Unable to create the new account',
        );
      }
      return {
        message: 'Successfully Created',
        statusCode: 200,
        newAccount,
      };
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new BadRequestException(
          'You have already used this name in one of your accounts.',
        );
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'Internal Server Error, Failed To Create New Account',
      );
    }
  }
  //Create New Family Memeber
  async createNewFamilyMember(newFamilyMember: FamilyMemberDto) {
    try {
      return await this.familyMemberService.register(newFamilyMember);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'Error, while creating the new member.',
      );
    }
  }
  //Create New Family Account
  async createFamilyAccount(newFamilyAccount: createFamilyAccountDto) {
    try {
      if (!newFamilyAccount.userId || !newFamilyAccount.userId.trim()) {
        throw new BadRequestException(
          'Must provide a user info for this request.',
        );
      }
      const userExists = await this.prisma.user.findFirst({
        where: { id: newFamilyAccount.userId },
      });
      if (!userExists) {
        throw new UnauthorizedException("The provided user doesn't exist.");
      }
      if (
        !newFamilyAccount.familyMemberInfo ||
        newFamilyAccount.familyMemberInfo.length === 0
      ) {
        throw new BadRequestException(
          "Add at least one family member's details to continue.",
        );
      }
      return await this.prisma.$transaction(async (txn) => {
        // Check existing accounts
        const existingAccounts = await txn.account.findMany({
          where: { userId: userExists.id },
        });
        if (existingAccounts.length === 0) {
          newFamilyAccount.isDefault = true;
        } else if (newFamilyAccount.isDefault === true) {
          await txn.account.updateMany({
            where: { userId: newFamilyAccount.userId },
            data: { isDefault: false },
          });
        }
        const { familyMemberInfo, ...newAccountInfo } = newFamilyAccount;
        // Create Account
        const newAccount = await txn.account.create({
          data: {
            userId: newAccountInfo.userId,
            name: newAccountInfo.name,
            type: newAccountInfo.type,
            balance: newAccountInfo.balance ?? 0,
            isDefault: newAccountInfo.isDefault ?? false,
          },
        });
        // Create Family Members
        const memberResults: any[] = [];
        for (const familyMember of familyMemberInfo) {
          const result = await txn.familyMember.create({
            data: {
              ...familyMember,
              accountId: newAccount.id,
              userId: newFamilyAccount.userId,
            },
          });
          memberResults.push(result);
        }
        return {
          message: 'Successfully Created New Account!',
          statusCode: 201,
          account: newAccount,
          memberResults,
        };
      });
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error');
    }
  }
  //Make the account the default account:
  async makeAccountDefault(userId: string, accountId: string) {
    try {
      //Get the account exists:
      const accountExists = await this.prisma.account.findFirst({
        where: {
          id: accountId,
          userId: userId,
        },
      });
      if (!accountExists) {
        throw new NotFoundException(
          'The provided account not found in the system.',
        );
      }
      //Update other accounts:
      await this.prisma.account.updateMany({
        where: {
          userId: userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
      //Make the current account default:
      const account = await this.prisma.account.update({
        where: {
          id: accountId,
          userId: userId,
        },
        data: {
          isDefault: true,
        },
      });
      if (!account) {
        throw new ServiceUnavailableException(
          "The account update didn't occurred.",
        );
      }
      //Return
      return {
        message: 'This account is now set as your default.',
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'Unable to proceed the operations.',
      );
    }
  }
}
