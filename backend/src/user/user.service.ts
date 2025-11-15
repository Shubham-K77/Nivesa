/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { CreateUserDto } from './dto/create_user.dto';
import { RedisService } from 'src/redis/redis.service';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { randomInt } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  //Dependency Injection:
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly bcrypt: BcryptService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  //1. Get Requests:
  async getAllUsers() {
    try {
      const userData = await this.prisma.user.findMany();
      //Check Query's Execution:
      if (!userData) {
        throw new ServiceUnavailableException(
          'Error in the server while executing the query',
        );
      }
      //Check If It's Empty:
      if (userData.length === 0) {
        throw new NotFoundException(
          'There is no immediate data available in the system.',
        );
      }
      //Successfully Retrieved:
      return {
        message: "Successfully Retrieved The User's Info!",
        userData,
        statusCode: 200,
      };
    } catch (error: any) {
      //If there is already an error being thrown show it:
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException(error.message);
    }
  }
  //2. Post Requests:
  //i. Create The New User In Redis
  async createUser(newUserInfo: CreateUserDto) {
    try {
      //Encrypt the password:
      newUserInfo['password'] = await this.bcrypt.encrypt(newUserInfo.password);
      //Check if the user info already exists in the redis:
      const userExists = await this.redis.get(newUserInfo.email);
      if (userExists) {
        throw new BadRequestException(
          'The provided user already exists in the redis database',
        );
      }
      //Create a new user data to store in redis:
      newUserInfo['otp'] = randomInt(
        parseInt(this.configService.get<string>('min_value') || '1000000'),
        parseInt(this.configService.get<string>('max_value') || '999999') + 1,
      ).toString();
      newUserInfo['rate'] = 5;
      //Trying to create a new user in the redis db:
      const newUser = await this.redis.set(newUserInfo.email, newUserInfo, {
        ttl: 300,
      });
      if (!newUser) {
        throw new ServiceUnavailableException(
          'Internal Redis Server Error! Failed To Record The User Info!',
        );
      }
      //Create a new jwt token for the user to be verified:
      const otpToken = this.jwtService.sign(
        { email: newUserInfo.email },
        {
          secret: this.configService.get<string>('verify_user_token_secret'),
          expiresIn: '5m', //Otp Validation For 5 Mins
        },
      );
      //If Successfully Created:
      return {
        message: 'Successfully Stored In The Redis DB!',
        statusCode: 200,
        token: otpToken,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      // Log the actual error for debugging
      console.error('verifyUser Error:', error);
      throw new ServiceUnavailableException(
        `Internal Server Error: ${error.message}`,
      );
    }
  }
  //ii. Verify The User And Insert In DB
  async verifyUser(token: string, verifyInfo: { otp: string }) {
    try {
      //Check the token info:
      if (!token || !token.trim()) {
        throw new BadRequestException(
          'Must provide the token info for verification.',
        );
      }
      //Verify the token:
      let isValid;
      try {
        isValid = await this.jwtService.verify(token, {
          secret: this.configService.get<string>('verify_user_token_secret'),
        });
      } catch (jwtError) {
        throw new UnauthorizedException(
          'The provided token is invalid or expired.',
        );
      }
      //Check the redis value:
      const userInfo = await this.redis.get(isValid.email);
      if (!userInfo) {
        throw new NotFoundException(
          'Must verify under 5 mins, the data is erased already.',
        );
      }
      //Otp Validation:
      if (userInfo.rate <= 0) {
        await this.redis.del(isValid.email);
        throw new UnauthorizedException(
          'The rate for validation is exhausted. Try Again!',
        );
      } else {
        //If The Otp was incorrect:
        if (verifyInfo.otp !== userInfo.otp) {
          userInfo.rate -= 1;
          if (userInfo.rate <= 0) {
            await this.redis.del(isValid.email);
            throw new UnauthorizedException(
              'The rate for validation is exhausted. Try Again!',
            );
          }
          await this.redis.set(isValid.email, userInfo, { ttl: 300 });
          throw new BadRequestException(
            `Incorrect Otp. Chances Left: ${userInfo.rate}`,
          );
        } else {
          //Exlcude the rate and otp:
          const { rate, otp, ...userData } = userInfo;
          //Insert Data Into Prisma:
          const newUser = await this.prisma.user.create({ data: userData });
          if (!newUser) {
            throw new ServiceUnavailableException(
              'Error while creating new user, DB Error!',
            );
          }
          //Response:
          return {
            message: 'Successfully Created New User!',
            statusCode: 201,
            newUser,
          };
        }
      }
    } catch (error: any) {
      //If There is Http Execption
      if (error instanceof HttpException) {
        throw error;
      }
      // Log the actual error for debugging
      console.error('verifyUser Error:', error);
      throw new ServiceUnavailableException(
        `Internal Server Error: ${error.message}`,
      );
    }
  }
}
