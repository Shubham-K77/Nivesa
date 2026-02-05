import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { BcryptModule } from './bcrypt/bcrypt.module';
import { MailerModule } from './mailer/mailer.module';
import { AccountModule } from './account/account.module';
import { FamilyMemberModule } from './family-member/family-member.module';
import { TransactionModule } from './transaction/transaction.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { BudgetModule } from './budget/budget.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { ArcjetModule } from './arcjet/arcjet.module';
import { GroqModule } from './groq/groq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('access_token_secret'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    UserModule,
    PrismaModule,
    RedisModule,
    BcryptModule,
    MailerModule,
    AccountModule,
    FamilyMemberModule,
    TransactionModule,
    CloudinaryModule,
    BudgetModule,
    WhatsappModule,
    ArcjetModule,
    GroqModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
