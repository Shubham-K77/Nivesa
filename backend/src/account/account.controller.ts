import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create_account.dto';
import { UserLoginGuard } from 'src/user/guard/user.login.guard';

@Controller('/accounts')
export class AccountController {
  //Dependency Injection
  constructor(private readonly accountService: AccountService) {}
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
