import { Module } from '@nestjs/common';
import { FamilyMemberController } from './family-member.controller';
import { FamilyMemberService } from './family-member.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { BcryptModule } from 'src/bcrypt/bcrypt.module';

@Module({
  imports: [JwtModule, PrismaModule, BcryptModule, MailerModule],
  controllers: [FamilyMemberController],
  providers: [FamilyMemberService],
  exports: [FamilyMemberService],
})
export class FamilyMemberModule {}
