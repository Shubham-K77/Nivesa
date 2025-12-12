import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FamilyMemberModule } from 'src/family-member/family-member.module';

@Module({
  imports: [JwtModule, PrismaModule, FamilyMemberModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
