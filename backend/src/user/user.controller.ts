import {
  Body,
  Controller,
  Get,
  ValidationPipe,
  Post,
  Param,
  Res,
  Req,
  UseGuards,
  HttpException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create_user.dto';
import type { Response, Request } from 'express';
import { UserLoginGuard } from 'src/guard/user.login.guard';
import { RestrictFamilyMemberGuard } from 'src/guard/restrict-familyMember.guard';

@Controller('users')
export class UserController {
  //Dependency Injection
  constructor(private readonly userService: UserService) {}
  //1. Get Requests:
  //Get All The Users Info
  @Get()
  @UseGuards(UserLoginGuard, RestrictFamilyMemberGuard)
  async getAllUsers() {
    const result = await this.userService.getAllUsers();
    return result;
  }
  //Get The Current Logged In User
  @Get('/active')
  @UseGuards(UserLoginGuard)
  getCurrentUser(@Req() req: Request, @Res() res: Response) {
    try {
      const currentUser = req['current_user'];
      if (!currentUser) {
        throw new UnauthorizedException(
          'Must login to retrieve the information',
        );
      }
      return res.status(200).send({
        message: 'Successfully Retrieved',
        statusCode: 200,
        currentUser,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'Internal Server Error, Unable to retrieve the current user info!',
      );
    }
  }
  //2. Post Requests:
  //Create The New User In Redis Db
  @Post()
  async createNewUser(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ) {
    const result = await this.userService.createUser(createUserDto);
    return result;
  }
  //Verify The User
  @Post('/verify/:token')
  async verifyUser(
    @Param('token') token: string,
    @Body() verifyInfo: { otp: string },
  ) {
    const result = await this.userService.verifyUser(token, verifyInfo);
    return result;
  }
  //Resend The Otp Again
  @Post('/resend/:token')
  async resendOtp(@Param('token') token: string) {
    const result = await this.userService.resendOtp(token);
    return result;
  }
  //Reset The Password: Ask For Email
  @Post('/reset')
  async resetPasswordEmail(@Body('email') email: string) {
    const result = await this.userService.resetPasswordEmail(email);
    return result;
  }
  //Resend The Otp Again To Reset Password
  @Post('/reset/resend/:token')
  async resetResendOtp(@Param('token') token: string) {
    const result = await this.userService.resetResendOtp(token);
    return result;
  }
  //Reset The Password: Check Otp
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
  //Reset The Password
  @Post('/reset/password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    const result = await this.userService.resetPassword(token, newPassword);
    return result;
  }
  //Login The User
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
  //Logout The User
  @Post('/logout')
  logout(@Res({ passthrough: true }) res: Response) {
    try {
      //Remove Both Of The Cookies
      res.cookie(
        'access_token',
        {},
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 0,
        },
      );
      res.cookie(
        'refresh_token',
        {},
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 0,
        },
      );
      res.status(200).send({
        message: 'Successfully Logged Out Of The System!',
        statusCode: 200,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'Unable to execute the logout procedure',
      );
    }
  }
}
