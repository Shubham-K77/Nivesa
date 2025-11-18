import {
  Body,
  Controller,
  Get,
  ValidationPipe,
  Post,
  Param,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create_user.dto';
import type { Response } from 'express';

@Controller('users')
export class UserController {
  //Dependency Injection
  constructor(private readonly userService: UserService) {}
  //1. Get Requests:
  //Get All The Users Info
  @Get()
  async getAllUsers() {
    const result = await this.userService.getAllUsers();
    return result;
  }
  //2. Post Requests:
  //i. Create The New User In Redis Db
  @Post()
  async createNewUser(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ) {
    const result = await this.userService.createUser(createUserDto);
    return result;
  }
  //ii. Verify The User
  @Post('/verify/:token')
  async verifyUser(
    @Param('token') token: string,
    @Body() verifyInfo: { otp: string },
  ) {
    const result = await this.userService.verifyUser(token, verifyInfo);
    return result;
  }
  //iii. Resend The Otp Again
  @Post('/resend/:token')
  async resendOtp(@Param('token') token: string) {
    const result = await this.userService.resendOtp(token);
    return result;
  }
  //iv.1. Reset The Password: Ask For Email
  @Post('/reset')
  async resetPasswordEmail(@Body('email') email: string) {
    const result = await this.userService.resetPasswordEmail(email);
    return result;
  }
  //iv.2. Reset The Password: Check Otp
  @Post('/reset/verify/:token')
  async resetPasswordCheckOtp(
    @Param('token') token: string,
    @Body() verifyInfo: { otp: string },
  ) {
    const result = await this.userService.resetPasswordCheckOtp(
      token,
      verifyInfo,
    );
    return result;
  }
  //iv.3. Reset The Password
  @Post('/reset/password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    const result = await this.userService.resetPassword(token, newPassword);
    return result;
  }
  //v. Login The User
  @Post('/login')
  async login(
    @Body() credentials: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.userService.login({
      email: credentials.email,
      password: credentials.password,
    });
    //Access_Token
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, //15 Mins
    });
    //Refresh_Token
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3 * 24 * 60 * 60 * 1000, //3 Days
    });
    //Return The Response:
    return {
      message: result.message,
      statusCode: result.statusCode,
    };
  }
}
