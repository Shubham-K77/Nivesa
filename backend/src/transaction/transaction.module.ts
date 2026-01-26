import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ArcjetModule } from 'src/arcjet/arcjet.module';
@Module({
  imports: [PrismaModule, JwtModule, ArcjetModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
