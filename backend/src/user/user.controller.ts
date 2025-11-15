import {
  Body,
  Controller,
  Get,
  ValidationPipe,
  Post,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create_user.dto';

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
}
