import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { MailerService } from 'src/mailer/mailer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FamilyMemberDto } from './dto/familyMember.create.dto';
import crypto from 'crypto';

@Injectable()
export class FamilyMemberService {
  //Dependency Injection:
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcrypt: BcryptService,
    private readonly mailer: MailerService,
  ) {}
  //Functions:
  async register(familyMemberInfo: FamilyMemberDto) {
    try {
      //Check If The User Info Provided Is Valid
      if (!familyMemberInfo.userId || !familyMemberInfo.userId.trim()) {
        throw new BadRequestException(
          'Must provide a valid user of the platform',
        );
      }
      const userExists = await this.prisma.user.findUnique({
        where: { id: familyMemberInfo.userId },
      });
      if (!userExists) {
        throw new UnauthorizedException(
          "The provided user doesn't exist in the system.",
        );
      }
      //Check If The Account Info Provided Is Valid
      if (!familyMemberInfo.accountId || !familyMemberInfo.accountId.trim()) {
        throw new BadRequestException('Must provide a valid account info!');
      }
      const accountExists = await this.prisma.account.findUnique({
        where: { id: familyMemberInfo.accountId },
      });
      if (!accountExists || accountExists.type !== 'FAMILY') {
        throw new UnauthorizedException(
          "The provided account doesn't exist on the system.",
        );
      }
      //Check if family member with same name already exists for this user
      const existingFamilyMember = await this.prisma.familyMember.findFirst({
        where: {
          userId: familyMemberInfo.userId,
          name: familyMemberInfo.name,
        },
      });
      if (existingFamilyMember) {
        return {
          message:
            'This family member already exists in your account. No new member was created.',
          statusCode: 200,
          newFamilyMember: existingFamilyMember,
        };
      }
      //Check if login credentials with same email already exist for FAMILY_MEMBER role
      const { email, ...userData } = familyMemberInfo;
      if (email?.trim()) {
        const existingLoginCredential =
          await this.prisma.loginCredentials.findFirst({
            where: {
              email: email,
              role: 'FAMILY_MEMBER',
            },
            include: {
              familyMember: true,
            },
          });
        if (existingLoginCredential && existingLoginCredential.familyMember) {
          // Email exists - check if it belongs to the same person
          if (
            existingLoginCredential.familyMember.name === familyMemberInfo.name
          ) {
            // Same person, same email - return success (already exists)
            return {
              message:
                'This family member already exists in the system. No new member was created.',
              statusCode: 200,
              newFamilyMember: existingLoginCredential.familyMember,
            };
          } else {
            // Different person trying to use the same email - throw error
            throw new BadRequestException(
              'This email is already registered to another family member. Please use a different email address.',
            );
          }
        }
      }
      //Create the familyMember Account And LoginCredential
      let message: string;
      const newFamilyMember = await this.prisma.familyMember.create({
        data: userData,
      });
      if (!newFamilyMember) {
        throw new ServiceUnavailableException(
          'Internal Server Error. Failed To Create New Family Member!',
        );
      }
      //Create the new invitationToken and invitationExpiry
      if (email?.trim()) {
        message =
          'New member added successfully. Please verify the email within 3 days to access the system.';
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const invitationExpiry = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
        await this.prisma.familyMember.update({
          where: { id: newFamilyMember.id },
          data: { invitationToken, invitationExpiry },
        });
        //Create new login credential:
        const newLoginCredential = await this.prisma.loginCredentials.create({
          data: {
            email,
            password: '',
            role: 'FAMILY_MEMBER',
            familyMemberId: newFamilyMember.id,
          },
        });
        if (!newLoginCredential) {
          throw new ServiceUnavailableException(
            'Unable to create the new family member!',
          );
        }
        //Send The Email To Setup The Account
        await this.mailer.familyMemberInvitationMail(
          email,
          invitationToken,
          userExists.name,
        );
      } else {
        message = 'Successfully Added The New Family Member!';
      }
      //Response
      return {
        message,
        statusCode: 201,
        newFamilyMember,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error');
    }
  }
  //Validate the token and setup the password
  async validate({
    token,
    newPassword,
  }: {
    token: string;
    newPassword: string;
  }) {
    try {
      //Check For The Token
      if (!token || !token.trim()) {
        throw new BadRequestException('Must provide a valid token');
      }
      //Check For The Password
      if (!newPassword || !newPassword.trim()) {
        throw new BadRequestException('Must provide a valid password');
      }
      //Then, Check For The Token
      const familyMemberExists = await this.prisma.familyMember.findFirst({
        where: { invitationToken: token },
      });
      if (!familyMemberExists) {
        throw new UnauthorizedException('No member found in the system');
      }
      if (!familyMemberExists.invitationExpiry) {
        throw new UnauthorizedException(
          'No invitation expiry set for this member.',
        );
      } else {
        if (new Date() > familyMemberExists.invitationExpiry) {
          throw new UnauthorizedException('The token has already expired.');
        }
      }
      const loginCredentialsExists =
        await this.prisma.loginCredentials.findUnique({
          where: {
            familyMemberId: familyMemberExists.id,
            role: 'FAMILY_MEMBER',
          },
        });
      if (!loginCredentialsExists) {
        throw new UnauthorizedException(
          'There was no such member found in the system',
        );
      }
      //The token is valid, then after process
      const hashedPassword = await this.bcrypt.encrypt(newPassword);
      if (!hashedPassword) {
        throw new ServiceUnavailableException(
          'The password encryption failed!',
        );
      }
      //Update the instance
      const updatedLoginCredentials = await this.prisma.loginCredentials.update(
        {
          where: {
            id: loginCredentialsExists.id,
            familyMemberId: familyMemberExists.id,
            role: 'FAMILY_MEMBER',
          },
          data: {
            password: hashedPassword,
          },
        },
      );
      if (!updatedLoginCredentials) {
        throw new ServiceUnavailableException('Internal Server Error!');
      }
      const updatedUser = await this.prisma.familyMember.update({
        where: { id: updatedLoginCredentials.familyMemberId || '' },
        data: { invitationToken: '', invitationExpiry: null, isActive: true },
      });
      if (!updatedUser) {
        throw new ServiceUnavailableException('Internal Server Error');
      }
      //Response:
      return {
        message: 'Successfully Updated!',
        statusCode: 200,
        familyMember: updatedUser,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error');
    }
  }
  //Resend The Link And The Token
  async resendInvite(userId: string, familyMemberId: string) {
    try {
      if (!userId || !userId.trim()) {
        throw new BadRequestException(
          'The information of the current user must be provided!',
        );
      }
      if (!familyMemberId || !familyMemberId.trim()) {
        throw new BadRequestException(
          'The information of the family member must be provided!',
        );
      }
      const familyMemberExists = await this.prisma.familyMember.findFirst({
        where: { id: familyMemberId, userId },
        include: { user: true },
      });
      if (!familyMemberExists) {
        throw new NotFoundException(
          "The individual wasn't found in the system",
        );
      }
      if (familyMemberExists && familyMemberExists.isActive) {
        throw new BadRequestException(
          'The member is already active in the platform',
        );
      }
      familyMemberExists.invitationToken = crypto
        .randomBytes(32)
        .toString('hex');
      familyMemberExists.invitationExpiry = new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000,
      );
      //Access The Email:
      const loginCredentialsExists =
        await this.prisma.loginCredentials.findFirst({
          where: {
            familyMemberId: familyMemberExists.id,
            role: 'FAMILY_MEMBER',
          },
        });
      if (!loginCredentialsExists) {
        throw new UnauthorizedException(
          "The provided member doesn't have existing info to validate.",
        );
      }
      //Send The Email To Setup The Account
      await this.mailer.familyMemberInvitationMail(
        loginCredentialsExists.email,
        familyMemberExists.invitationToken,
        familyMemberExists.user.name,
      );
      //Response:
      return {
        message: 'New invitation link sent! Please validate it within 3 days.',
        statusCode: 200,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error');
    }
  }
}
