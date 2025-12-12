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
import { createFamilyAccountDto } from './dto/create_family_account.dto';

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
  //i. Create New Account: 'CURRENT' || 'SAVINGS'
  @Post()
  @UseGuards(UserLoginGuard)
  async createNewAccount(
    @Body(new ValidationPipe()) accountInfo: CreateAccountDto,
  ) {
    const result = await this.accountService.createAccount(accountInfo);
    return result;
  }
  //ii. Create New Account: 'Family'
  @Post('/family')
  @UseGuards(UserLoginGuard)
  async createNewFamilyAccount(
    @Body(new ValidationPipe()) familyAccountInfo: createFamilyAccountDto,
  ) {
    const result =
      await this.accountService.createFamilyAccount(familyAccountInfo);
    return result;
  }
}
