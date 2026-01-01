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
import { MailerService } from 'src/mailer/mailer.service';
import { UpdateUserDto } from './dto/udpate_user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  //Dependency Injection:
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly bcrypt: BcryptService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly cloudinary: CloudinaryService,
  ) {}
  //1. Get Requests:
  async getAllUsers() {
    try {
      const userData = await this.prisma.user.findMany();
      //Check Query's Execution:
      if (!userData) {
        throw new ServiceUnavailableException(
          'Unable to retrieve user data. Please try again later.',
        );
      }
      //Check If It's Empty:
      if (userData.length === 0) {
        throw new NotFoundException('No users found in the system.');
      }
      //Successfully Retrieved:
      return {
        message: 'User information retrieved successfully.',
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
          'A verification is already in progress for this email address. Please check your email or try again after 5 minutes.',
        );
      }
      //Check against the db
      const emailExists = await this.prisma.loginCredentials.findFirst({
        where: {
          email: newUserInfo.email,
          role: 'USER',
        },
      });
      if (emailExists) {
        throw new BadRequestException(
          'An account with this email address already exists. Please sign in or use a different email.',
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
          'Unable to process your registration at this time. Please try again later.',
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
      //Send the mail to the user for the otp:
      await this.mailerService.otpMail(
        newUserInfo.email,
        newUserInfo.otp,
        'initial',
      );
      //If Successfully Created:
      return {
        message:
          'OTP sent to your email. Please verify your account within 5 minutes.',
        statusCode: 201,
        token: otpToken,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      // Log the actual error for debugging
      console.error('createUser Error:', error);
      throw new ServiceUnavailableException(
        'An unexpected error occurred during registration. Please try again later.',
      );
    }
  }
  //ii. Verify The User And Insert In DB
  async verifyUser(token: string, verifyInfo: { otp: string }) {
    try {
      //Check the token info:
      if (!token || !token.trim()) {
        throw new BadRequestException('Verification token is required.');
      }
      //Verify the token:
      let isValid;
      try {
        isValid = await this.jwtService.verify(token, {
          secret: this.configService.get<string>('verify_user_token_secret'),
        });
      } catch (jwtError) {
        throw new UnauthorizedException(
          'Your verification link has expired or is invalid. Please request a new verification code.',
        );
      }
      //Check the redis value:
      const userInfo = await this.redis.get(isValid.email);
      if (!userInfo) {
        throw new NotFoundException(
          'Verification session has expired. Please sign up again to receive a new verification code.',
        );
      }
      //Checking the rate first:
      if (userInfo.rate <= 0) {
        await this.redis.del(isValid.email);
        throw new UnauthorizedException(
          'Maximum verification attempts exceeded. Please sign up again to receive a new verification code.',
        );
      } else {
        //If The Otp was incorrect:
        if (verifyInfo.otp !== userInfo.otp) {
          userInfo.rate -= 1;
          if (userInfo.rate <= 0) {
            await this.redis.del(isValid.email);
            throw new UnauthorizedException(
              'Maximum verification attempts exceeded. Please sign up again to receive a new verification code.',
            );
          }
          await this.redis.set(isValid.email, userInfo, { ttl: 300 });
          throw new BadRequestException(
            `Incorrect verification code. You have ${userInfo.rate} attempt${userInfo.rate !== 1 ? 's' : ''} remaining.`,
          );
        } else {
          //Exlcude the rate, otp, email, password:
          const { rate, otp, email, password, ...userData } = userInfo;
          //Insert into user table first
          const newUser = await this.prisma.user.create({ data: userData });
          if (!newUser) {
            throw new ServiceUnavailableException(
              'Unable to create your account at this time. Please try again later.',
            );
          }
          //Insert Data Into Login Credentials Then:
          const newLoginInfo = await this.prisma.loginCredentials.create({
            data: { email, password, role: 'USER', userId: newUser.id },
          });
          if (!newLoginInfo) {
            throw new ServiceUnavailableException(
              'Unable to create the user at this moment. Please try again later.',
            );
          }
          //Delete The Redis:
          await this.redis.del(isValid.email);
          //Send The Mail:
          await this.mailerService.verifiedMail(userInfo.email);
          //Response:
          return {
            message:
              'Your email has been successfully verified. Your account is now active and you can sign in using your credentials.',
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
        'An unexpected error occurred during verification. Please try again later.',
      );
    }
  }
  //iii. Resend The Otp To New User
  async resendOtp(token: string) {
    try {
      //Check The Token:
      if (!token || !token.trim()) {
        throw new BadRequestException(
          'Verification token is required to resend OTP.',
        );
      }
      let isValid: any;
      try {
        isValid = await this.jwtService.verify(token, {
          secret: this.configService.get<string>('verify_user_token_secret'),
        });
      } catch (error: any) {
        throw new UnauthorizedException(
          'Your session has expired. Please sign up again to create a new account.',
        );
      }
      //Get The UserInfo From The Redis Server:
      const userInfo = await this.redis.get(isValid.email);
      if (!userInfo) {
        throw new NotFoundException(
          'Verification session not found. Please sign up again to receive a new verification code.',
        );
      }
      //Then Regenerate The New Token And Reset The Rate:
      userInfo['otp'] = randomInt(
        parseInt(this.configService.get<string>('min_value') || '100000'),
        parseInt(this.configService.get<string>('max_value') || '999999') + 1,
      ).toString();
      userInfo['rate'] = 5;
      //Update The New Data Into Redis:
      const updatedUser = await this.redis.set(userInfo.email, userInfo, {
        ttl: 300,
      });
      if (!updatedUser) {
        throw new ServiceUnavailableException(
          'Unable to resend verification code at this time. Please try again later.',
        );
      }
      //New Jwt Token After Reset:
      const otpToken = this.jwtService.sign(
        { email: userInfo.email },
        {
          secret: this.configService.get<string>('verify_user_token_secret'),
          expiresIn: '5m', //Otp Validation For 5 Mins
        },
      );
      //Send the mail to the user for the otp:
      await this.mailerService.otpMail(userInfo.email, userInfo.otp, 'resend');
      //If Successfully Created:
      return {
        message:
          'New OTP has been sent to your email. Please verify your account within 5 minutes.',
        statusCode: 200,
        token: otpToken,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'An unexpected error occurred while resending verification code. Please try again later.',
      );
    }
  }
  //iv.1) Reset The Password For Both User and Family Member
  async resetPasswordEmail(email: string) {
    try {
      //Check the email, whether it is valid
      if (!email || !email.trim()) {
        throw new BadRequestException(
          'Email address is required to reset your password.',
        );
      }
      //Check Against Db
      const userExists = await this.prisma.loginCredentials.findFirst({
        where: {
          email: email,
          role: 'USER',
        },
      });
      if (!userExists) {
        const familyMemberExists = await this.prisma.loginCredentials.findFirst(
          {
            where: {
              email: email,
              role: 'FAMILY_MEMBER',
            },
          },
        );
        if (!familyMemberExists) {
          throw new UnauthorizedException(
            'No account found with this email address. Please check your email or sign up for a new account.',
          );
        }
      }
      //Redis Payload
      const newOtp = randomInt(
        parseInt(this.configService.get<string>('min_value') || '100000'),
        parseInt(this.configService.get<string>('max_value') || '999999') + 1,
      ).toString();
      const rate = 5;
      //Create New Redis Info
      const resetUser = await this.redis.set(
        `reset-${email}`,
        { email, otp: newOtp, rate },
        { ttl: 300 },
      );
      if (!resetUser) {
        throw new ServiceUnavailableException(
          'Unable to process your password reset request at this time. Please try again later.',
        );
      }
      //Create New Token
      const token = this.jwtService.sign(
        { email },
        {
          secret: this.configService.get<string>('reset_password_email'),
          expiresIn: '5m',
        },
      );
      //Send The Email For The Reset Otp
      await this.mailerService.otpMail(email, newOtp, 'reset');
      //Response
      return {
        message:
          'A verification code has been sent to your email address. Please verify within 5 minutes to proceed with password reset.',
        statusCode: 200,
        token,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'An unexpected error occurred while processing your password reset request. Please try again later.',
      );
    }
  }
  //iv.2) Reset The Password [Resend The Otp]
  async resetResendOtp(token: string) {
    try {
      //Check the token:
      if (!token || !token.trim()) {
        throw new BadRequestException(
          'Verification token is required to resend OTP.',
        );
      }
      let isValid;
      try {
        isValid = await this.jwtService.verify(token, {
          secret: this.configService.get<string>('reset_password_email'),
        });
      } catch (error: any) {
        throw new UnauthorizedException(
          'Either the token is invalid or is expired',
        );
      }
      //Check Against Redis
      const userInfo = await this.redis.get(`reset-${isValid.email}`);
      if (!userInfo) {
        throw new NotFoundException(
          'Verification session not found. Please reset the whole process again.',
        );
      }
      //Then Regenerate The New OTP And Reset The Rate:
      userInfo['otp'] = randomInt(
        parseInt(this.configService.get<string>('min_value') || '100000'),
        parseInt(this.configService.get<string>('max_value') || '999999') + 1,
      ).toString();
      userInfo['rate'] = 5;
      //Update into redis
      const updatedUser = await this.redis.set(
        `reset-${userInfo.email}`,
        userInfo,
        { ttl: 300 },
      );
      if (!updatedUser) {
        throw new ServiceUnavailableException(
          'Unable to resend verification code at this time. Please try again later.',
        );
      }
      //Generate new jwt token:
      const otpToken = this.jwtService.sign(
        { email: userInfo.email },
        {
          secret: this.configService.get<string>('reset_password_email'),
          expiresIn: '5m', //Otp Validation For 5 Mins
        },
      );
      //Send the mail to the user for the otp:
      await this.mailerService.otpMail(userInfo.email, userInfo.otp, 'resend');
      //If Successfully Created:
      return {
        message:
          'New OTP has been sent to your email. Please enter the otp within 5 minutes.',
        statusCode: 200,
        token: otpToken,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error(error);
      throw new ServiceUnavailableException(
        'An unexpected error occurred while processing your password reset request. Please try again later.',
      );
    }
  }
  //iv.3) Reset Check Otp
  async resetPasswordCheckOtp(token: string, verifyInfo: { otp: string }) {
    try {
      //Check The Token Provided First:
      if (!token || !token.trim()) {
        throw new BadRequestException('Verification token is required.');
      }
      //Check The Token's Authenticity:
      let isValid;
      try {
        isValid = await this.jwtService.verify(token, {
          secret: this.configService.get<string>('reset_password_email'),
        });
      } catch (error: any) {
        throw new UnauthorizedException(
          'Your password reset link has expired or is invalid. Please request a new password reset.',
        );
      }
      //Check The Redis
      const resetUserExists = await this.redis.get(`reset-${isValid.email}`);
      if (!resetUserExists) {
        throw new NotFoundException(
          'Password reset session has expired. Please request a new password reset to continue.',
        );
      }
      //Check Whether The Limit Is Exhausted
      if (resetUserExists.rate <= 0) {
        await this.redis.del(`reset-${resetUserExists.email}`);
        throw new UnauthorizedException(
          'Maximum verification attempts exceeded. Please request a new password reset.',
        );
      } else {
        //If the otp is invalid
        if (verifyInfo.otp !== resetUserExists.otp) {
          resetUserExists.rate = resetUserExists.rate - 1;
          //Check If The Limit Is Exhausted
          if (resetUserExists.rate <= 0) {
            await this.redis.del(`reset-${resetUserExists.email}`);
            throw new UnauthorizedException(
              'Maximum verification attempts exceeded. Please request a new password reset.',
            );
          }
          //Update The Redis With New Info
          await this.redis.set(
            `reset-${resetUserExists.email}`,
            resetUserExists,
            { ttl: 300 },
          );
          //Response:
          throw new BadRequestException(
            `Incorrect verification code. You have ${resetUserExists.rate} attempt${resetUserExists.rate !== 1 ? 's' : ''} remaining.`,
          );
        } else {
          //Delete the redis
          await this.redis.del(`reset-${resetUserExists.email}`);
          //Create another new token
          const token = this.jwtService.sign(
            { email: resetUserExists.email },
            {
              secret: this.configService.get<string>('reset_password_confirm'),
              expiresIn: '5m',
            },
          );
          //Create a new redis item
          const newUserItem = await this.redis.set(
            `reset-final-${resetUserExists.email}`,
            {},
            { ttl: 300 },
          );
          if (!newUserItem) {
            throw new ServiceUnavailableException('Internal Server Error');
          }
          //Response
          return {
            message:
              'Verification successful. You can now proceed to reset your password. This link will remain valid for 5 minutes.',
            statusCode: 200,
            token,
          };
        }
      }
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'An unexpected error occurred during verification. Please try again later.',
      );
    }
  }
  //iv.4) Reset With The New Password For Both User and Family Member
  async resetPassword(token: string, newPassword: string) {
    try {
      //Check the provided informations:
      if (!token || !token.trim()) {
        throw new BadRequestException('Reset token is required.');
      }
      if (!newPassword || !newPassword.trim()) {
        throw new BadRequestException('New password is required.');
      }
      //Check Validity of the token
      let isValid;
      try {
        isValid = await this.jwtService.verify(token, {
          secret: this.configService.get<string>('reset_password_confirm'),
        });
      } catch (error: any) {
        throw new UnauthorizedException(
          'Your password reset link has expired or is invalid. Please request a new password reset.',
        );
      }
      //Check The Redis Item
      const redisExists = await this.redis.get(`reset-final-${isValid.email}`);
      if (!redisExists) {
        throw new UnauthorizedException(
          'Password already reset or session expired.',
        );
      }
      //Extract The Email And Check Against DB
      const userExists = await this.prisma.loginCredentials.findFirst({
        where: { email: isValid.email, role: 'USER' },
      });
      let familyMemberExists;
      if (!userExists) {
        familyMemberExists = await this.prisma.loginCredentials.findFirst({
          where: { email: isValid.email, role: 'FAMILY_MEMBER' },
        });
        if (!familyMemberExists) {
          throw new NotFoundException(
            'Account not found. Please contact support if you believe this is an error.',
          );
        }
      }
      //Hash The Password And Reset It
      const hashedPassword = await this.bcrypt.encrypt(newPassword);
      let updatedUserInfo;
      if (userExists) {
        updatedUserInfo = await this.prisma.loginCredentials.update({
          where: { id: userExists.id },
          data: { password: hashedPassword },
          select: { id: true },
        });
      } else if (familyMemberExists) {
        updatedUserInfo = await this.prisma.loginCredentials.update({
          where: { id: familyMemberExists.id },
          data: { password: hashedPassword },
          select: { id: true },
        });
      }
      if (!updatedUserInfo) {
        throw new ServiceUnavailableException(
          'Unable to update your password at this time. Please try again later.',
        );
      }
      //Delete The Redis
      await this.redis.del(`reset-final-${isValid.email}`);
      //Send The Mail
      if (userExists) {
        await this.mailerService.resetPasswordMail(userExists.email);
      } else if (familyMemberExists) {
        await this.mailerService.resetPasswordMail(familyMemberExists.email);
      }
      //Response
      return {
        message:
          'Your password has been successfully reset. You can now sign in with your new password.',
        statusCode: 200,
        updatedUserInfo,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'An unexpected error occurred while resetting your password. Please try again later.',
      );
    }
  }
  //v. Login The Existing User
  async login({ email, password }: { email: string; password: string }) {
    try {
      //Check The Provided Info
      if (!email || !email.trim()) {
        throw new BadRequestException('Must provide a email for this request');
      }
      if (!password || !password.trim()) {
        throw new BadRequestException(
          'Must provide a password for this request',
        );
      }
      //Check If User Exists (no role filter - check both USER and FAMILY_MEMBER)
      let userExists = await this.prisma.loginCredentials.findFirst({
        where: { email, role: 'USER' },
        include: { user: true, familyMember: true },
      });
      if (!userExists) {
        userExists = await this.prisma.loginCredentials.findFirst({
          where: { email, role: 'FAMILY_MEMBER' },
          include: { user: true, familyMember: true },
        });
      }
      //Throw Error:
      if (!userExists) {
        throw new UnauthorizedException('Invalid email or password.');
      }
      if (userExists.familyMember && !userExists.familyMember.isActive) {
        throw new UnauthorizedException("The user isn't permitted to access");
      }
      //Check The User's Password
      const isPasswordValid = await this.bcrypt.decrypt(
        password,
        userExists.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password.');
      }
      //Check which role has logged in and generate tokens accordingly
      let access_token;
      let refresh_token;

      if (userExists.user) {
        // Main user login
        access_token = this.jwtService.sign(
          {
            id: userExists.user.id,
            email: userExists.email,
            phoneNumber: userExists.user?.phoneNumber || '',
            name: userExists.user.name,
            imageUrl: userExists.user?.imageUrl || '',
            role: userExists.role,
            createdAt: userExists.createdAt,
            updatedAt: userExists.updatedAt,
          },
          {
            secret: this.configService.get<string>('access_token_secret'),
            expiresIn: '15m',
          },
        );
        refresh_token = this.jwtService.sign(
          {
            id: userExists.user.id,
            email: userExists.email,
            phoneNumber: userExists.user?.phoneNumber || '',
            name: userExists.user.name,
            imageUrl: userExists.user?.imageUrl || '',
            role: userExists.role,
            createdAt: userExists.createdAt,
            updatedAt: userExists.updatedAt,
          },
          {
            secret: this.configService.get<string>('refresh_token_secret'),
            expiresIn: '3d',
          },
        );
      } else if (userExists.familyMember) {
        // Family member login
        access_token = this.jwtService.sign(
          {
            id: userExists.familyMember.id,
            email: userExists.email,
            phoneNumber: userExists.familyMember?.phoneNumber || '',
            name: userExists.familyMember?.name || '',
            role: userExists.role,
          },
          {
            secret: this.configService.get<string>('access_token_secret'),
            expiresIn: '15m',
          },
        );
        refresh_token = this.jwtService.sign(
          {
            id: userExists.familyMember.id,
            email: userExists.email,
            phoneNumber: userExists.familyMember?.phoneNumber || '',
            name: userExists.familyMember?.name || '',
            role: userExists.role,
          },
          {
            secret: this.configService.get<string>('refresh_token_secret'),
            expiresIn: '3d',
          },
        );
      } else {
        throw new UnauthorizedException('Invalid credentials.');
      }
      //Response
      return {
        message: 'Successfully logged in.',
        statusCode: 200,
        access_token,
        refresh_token,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'An unexpected error occurred while logging in. Please try again later.',
      );
    }
  }
  //3. Update The Information
  async getFreshUserData(userId: string, role: string) {
    if (role === 'USER') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { loginCredentials: { select: { email: true } } },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return {
        id: user.id,
        email: user.loginCredentials[0]?.email || '',
        phoneNumber: user.phoneNumber || '',
        name: user.name,
        imageUrl: user.imageUrl || '',
        role: role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } else if (role === 'FAMILY_MEMBER') {
      const familyMember = await this.prisma.familyMember.findUnique({
        where: { id: userId },
        include: { loginCredentials: { select: { email: true } } },
      });
      if (!familyMember) {
        throw new UnauthorizedException('Family member not found');
      }
      return {
        id: familyMember.id,
        email: familyMember.loginCredentials?.email || '',
        phoneNumber: familyMember.phoneNumber || '',
        name: familyMember.name || '',
        imageUrl: familyMember.imageUrl || '',
        role: role,
      };
    }
    throw new UnauthorizedException('Invalid role');
  }
  async updateProfile(userData: UpdateUserDto, userId: string) {
    try {
      //Check User Exists In The System
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { loginCredentials: true },
      });
      if (!userExists) {
        throw new UnauthorizedException(
          "Provided user doesn't exist in the system.",
        );
      }
      //Prepare update data
      const updateData: any = {
        name: userData.name,
        phoneNumber: userData.phoneNumber,
      };
      if (userData.profilePic) {
        if (userExists.imageUrl) {
          //Delete The Old File In Cloudinary
          const publicId = this.cloudinary.extractPublicId(userExists.imageUrl);
          await this.cloudinary.delete(publicId, 'image');
        }
        updateData.imageUrl = await this.cloudinary.upload(
          userData.profilePic,
          'image',
        );
      }
      //Handle password change
      if (userData.password && userData.newPassword) {
        const loginCreds = userExists.loginCredentials?.[0];
        if (!loginCreds) {
          throw new UnauthorizedException('Login credentials not found.');
        }
        const isPasswordValid = await this.bcrypt.decrypt(
          userData.password,
          loginCreds.password,
        );
        if (!isPasswordValid) {
          throw new UnauthorizedException('Current password is incorrect.');
        }
        const hashedPassword = await this.bcrypt.encrypt(userData.newPassword);
        await this.prisma.loginCredentials.update({
          where: { id: loginCreds.id },
          data: { password: hashedPassword },
        });
      }
      //Update The User Data
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
      if (!updatedUser) {
        throw new ServiceUnavailableException(
          'Failed to update the profile information',
        );
      }
      //Response
      return {
        message: 'Successfully updated!',
        statusCode: 200,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException('Internal Server Error!');
    }
  }
}
