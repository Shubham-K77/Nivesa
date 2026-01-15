import { Module, DynamicModule, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
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
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {
  static async registerAsync(): Promise<DynamicModule> {
    const arcjetNest = await import('@arcjet/nest');
    const { ArcjetModule, ArcjetGuard, shield, fixedWindow } = arcjetNest;

    return {
      module: AppModule,
      imports: [
        ArcjetModule.forRoot({
          isGlobal: true,
          key: process.env.ARJECT_KEY!,
          rules: [
            shield({ mode: 'DRY_RUN' }),
            fixedWindow({
              mode: 'DRY_RUN',
              window: '60s',
              max: 1000,
            }),
          ],
        }),
      ],
      providers: [
        {
          provide: APP_GUARD,
          useClass: ArcjetGuard,
        },
      ],
    };
  }
}
