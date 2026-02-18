import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ArcjetModule } from 'src/arcjet/arcjet.module';
import { ConfigModule } from '@nestjs/config';
import { GroqModule } from 'src/groq/groq.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    PrismaModule,
    JwtModule,
    ArcjetModule,
    ConfigModule,
    GroqModule,
    HttpModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
