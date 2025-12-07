import {
  BadRequestException,
  HttpException,
  Injectable,
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
      //Create the new invitationToken and invitationExpiry
      if (familyMemberInfo.email?.trim()) {
        familyMemberInfo['invitationToken'] = crypto
          .randomBytes(32)
          .toString('hex');
        familyMemberInfo['invitationExpiry'] = new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        );
        //Send The Email To Setup The Account
        await this.mailer.familyMemberInvitationMail(
          familyMemberInfo.email,
          familyMemberInfo?.invitationToken,
          userExists.name,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error');
    }
  }
  async setPassword() {}
  async login() {}
}
