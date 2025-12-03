import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  ValidationPipe,
  Param,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create_account.dto';
import { UserLoginGuard } from 'src/user/guard/user.login.guard';

@Controller('/accounts')
export class AccountController {
  //Dependency Injection
  constructor(private readonly accountService: AccountService) {}
  //Get Request
  @Get('/:id')
  @UseGuards(UserLoginGuard)
  async getAccountInfo(@Param('id') id: string) {
    const response = await this.accountService.getUserAccounts(id);
    return response;
  }
  //Post Request
  @Post()
  @UseGuards(UserLoginGuard)
  async createNewAccount(
    @Body(new ValidationPipe()) accountInfo: CreateAccountDto,
  ) {
    const result = await this.accountService.createAccount(accountInfo);
    return result;
  }
}
