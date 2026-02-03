/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
import { MailerService } from 'src/mailer/mailer.service';
import * as crypto from 'crypto';

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly familyMemberService: FamilyMemberService,
    private readonly mailer: MailerService,
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
  async getFamilyMembersInfo(userId: string, accountId: string) {
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
          familyMembers: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
            },
          },
        },
      });
      if (!accountInfo) {
        throw new ServiceUnavailableException(
          'Unable to retrieve at the moment. Please, try again!',
        );
      }
      //Return
      return {
        message: 'Successfully Retrieved',
        statusCode: 200,
        familyMembersInfo: accountInfo.familyMembers, //Returns an array of familyMembers Info
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

      const result = await this.prisma.$transaction(async (txn) => {
        // Step 1: Check existing accounts and handle isDefault flag
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

        // Step 2: Create Family Account first
        const newAccount = await txn.account.create({
          data: {
            userId: newFamilyAccount.userId,
            name: newFamilyAccount.name,
            type: newFamilyAccount.type,
            balance: newFamilyAccount.balance ?? 0,
            isDefault: newFamilyAccount.isDefault ?? false,
          },
        });

        // Step 3: Loop through and create each family member individually
        const createdMembers: any[] = [];
        for (const memberData of newFamilyAccount.familyMemberInfo) {
          // Check if family member with same name already exists for this user
          const existingMember = await txn.familyMember.findFirst({
            where: {
              userId: newFamilyAccount.userId,
              name: memberData.name,
            },
          });

          if (existingMember) {
            // Update existing member to link with this account if not already linked
            if (existingMember.accountId !== newAccount.id) {
              const updated = await txn.familyMember.update({
                where: { id: existingMember.id },
                data: { accountId: newAccount.id },
              });
              createdMembers.push(updated);
            } else {
              createdMembers.push(existingMember);
            }
            continue;
          }

          // Generate invitation token if email is provided
          let invitationToken: string | undefined;
          let invitationExpiry: Date | undefined;

          if (memberData.email?.trim()) {
            // Check if email already exists for FAMILY_MEMBER role
            const existingLoginCredential =
              await txn.loginCredentials.findFirst({
                where: {
                  email: memberData.email,
                  role: 'FAMILY_MEMBER',
                },
              });

            if (existingLoginCredential) {
              throw new BadRequestException(
                `The email ${memberData.email} is already registered to another family member.`,
              );
            }

            invitationToken = crypto.randomBytes(32).toString('hex');
            invitationExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
          }
          // Create new family member
          const newMember = await txn.familyMember.create({
            data: {
              name: memberData.name,
              phoneNumber: memberData.phoneNumber,
              imageUrl: memberData.imageUrl,
              invitationToken,
              invitationExpiry,
              isActive: false,
              userId: newFamilyAccount.userId,
              accountId: newAccount.id,
            },
          });
          createdMembers.push(newMember);
        }
        return {
          message: 'Successfully Created Family Account with Members!',
          statusCode: 201,
          account: newAccount,
          familyMembers: createdMembers,
        };
      });
      // Send invitation emails AFTER transaction completes
      for (const member of result.familyMembers) {
        const memberData = newFamilyAccount.familyMemberInfo.find(
          (m) => m.name === member.name,
        );
        if (memberData?.email?.trim() && member.invitationToken) {
          try {
            await this.mailer.familyMemberInvitationMail(
              memberData.email,
              member.invitationToken,
              userExists.name,
            );
          } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Don't fail the entire operation if email fails
          }
        }
      }
      return result;
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
  //Delete the account:
  async deleteAccount(userId: string, accountId: string) {
    try {
      //Check The UserId
      if (!userId || !userId.trim()) {
        throw new BadRequestException(
          'The specified user is not authorized. Please provide a valid platform user.!',
        );
      }
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExists) {
        throw new UnauthorizedException('The provided user is not authorized.');
      }
      //Check The AccountId
      if (!accountId || !accountId.trim()) {
        throw new BadRequestException('Please provide a valid account Info.!');
      }
      const accountExists = await this.prisma.account.findUnique({
        where: { id: accountId },
      });
      if (!accountExists) {
        throw new UnauthorizedException(
          "The provided account doesn't exist in the platform.",
        );
      }
      //Delete The Account
      const deleteAccount = await this.prisma.account.delete({
        where: { id: accountExists.id },
      });
      if (!deleteAccount) {
        throw new ServiceUnavailableException(
          'Delete operations failed, try again later!',
        );
      }
      //Response
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
