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
      //Check The User
      const userExists = await this.prisma.user.findFirst({
        where: {
          id: newFamilyAccount.userId,
        },
      });
      if (!userExists) {
        throw new UnauthorizedException("The provided user doesn't exist.");
      }
      //Validate family member Info
      if (
        !newFamilyAccount.familyMemberInfo ||
        newFamilyAccount.familyMemberInfo.length === 0
      ) {
        throw new BadRequestException(
          "Add at least one family member's details to continue.",
        );
      }
      //If This is only account make this default
      const existingAccounts = await this.prisma.account.findMany({
        where: {
          userId: userExists.id,
        },
      });
      if (existingAccounts.length === 0) {
        newFamilyAccount.isDefault = true;
      } else if (newFamilyAccount.isDefault === true) {
        await this.prisma.account.updateMany({
          where: { userId: newFamilyAccount.userId },
          data: { isDefault: false },
        });
      }
      //Create a new Account
      const { familyMemberInfo, ...newAccountInfo } = newFamilyAccount;
      const newAccount = await this.prisma.account.create({
        data: {
          userId: newAccountInfo.userId,
          name: newAccountInfo.name,
          type: newAccountInfo.type,
          balance: newAccountInfo.balance ?? 0,
          isDefault: newAccountInfo.isDefault ?? false,
        },
      });
      if (!newAccount) {
        throw new ServiceUnavailableException(
          'Account creation failed. Please check the details and retry.',
        );
      }
      //Loop Through The Family Member And Send It To Family Member Create Method
      for (const familyMember of familyMemberInfo) {
        await this.createNewFamilyMember({
          ...familyMember,
          accountId: newAccount.id,
          userId: newFamilyAccount.userId,
        });
      }
      //Response
      return {
        message: 'Successfully Created New Account!',
        statusCode: 201,
        account: newAccount,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error');
    }
  }
}
