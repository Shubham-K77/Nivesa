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
@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}
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
          _count: {
            select: {
              transactions: true,
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
}
