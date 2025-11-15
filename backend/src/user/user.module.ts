import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';
import { BcryptModule } from 'src/bcrypt/bcrypt.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, RedisModule, BcryptModule, JwtModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
