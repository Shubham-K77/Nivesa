import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  ValidationPipe,
  Param,
  Req,
  Patch,
  Delete,
  UnauthorizedException,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create_account.dto';
import { UserLoginGuard } from 'src/guard/user.login.guard';
import { createFamilyAccountDto } from './dto/create_family_account.dto';
import { RestrictFamilyMemberGuard } from 'src/guard/restrict-familyMember.guard';
import type { Request } from 'express';

@Controller('/accounts')
export class AccountController {
  //Dependency Injection
  constructor(private readonly accountService: AccountService) {}
  //Get Request
  @Get('/')
  @UseGuards(UserLoginGuard, RestrictFamilyMemberGuard)
  async getAccountInfo(@Req() req: Request) {
    const userId: string = req.current_user!.id;
    const response = await this.accountService.getUserAccounts(userId);
    return response;
  }
  @Get('/all')
  @UseGuards(UserLoginGuard, RestrictFamilyMemberGuard)
  async getEveryAccountInfo(@Req() req: Request) {
    const userId: string = req.current_user!.id;
    const response = await this.accountService.getUserEveryAccounts(userId);
    return response;
  }
  @Get('/:id')
  @UseGuards(UserLoginGuard)
  async getSpecificAccountInfo(@Req() req: Request, @Param('id') id: string) {
    const currentUser = req['current_user'];
    const userId: string = currentUser!.id;
    const role: string = currentUser?.role || 'USER';

    const response = await this.accountService.getAccount(userId, id, role);
    return response;
  }
  //Post Request
  //i. Create New Account: 'CURRENT' || 'SAVINGS'
  @Post()
  @UseGuards(UserLoginGuard, RestrictFamilyMemberGuard)
  async createNewAccount(
    @Body(new ValidationPipe()) accountInfo: CreateAccountDto,
  ) {
    const result = await this.accountService.createAccount(accountInfo);
    return result;
  }
  //ii. Create New Account: 'Family'
  @Post('/family')
  @UseGuards(UserLoginGuard, RestrictFamilyMemberGuard)
  async createNewFamilyAccount(
    @Body(new ValidationPipe()) familyAccountInfo: createFamilyAccountDto,
  ) {
    const result =
      await this.accountService.createFamilyAccount(familyAccountInfo);
    return result;
  }
  //iii. Patch change the isDefault Flag
  @Patch('/:id')
  @UseGuards(UserLoginGuard, RestrictFamilyMemberGuard)
  async updateIsDefaultFlag(@Req() req: Request, @Param('id') id: string) {
    // @typescript-eslint/no-unsafe-member-access
    const userId: string = req.current_user!.id;
    const response = await this.accountService.makeAccountDefault(userId, id);
    return response;
  }
  //iv. Delete the Account
  @Delete('/:id')
  @UseGuards(UserLoginGuard, RestrictFamilyMemberGuard)
  async deleteAccount(@Req() req: Request, @Param('id') id: string) {
    const userId: string = req.current_user!.id;
    const response = await this.accountService.deleteAccount(userId, id);
    return response;
  }

  // Family Member Endpoints
  @Get('/family-member/accounts')
  @UseGuards(UserLoginGuard)
  async getFamilyMemberAccounts(@Req() req: Request) {
    const currentUser = req['current_user'];
    if (!currentUser || currentUser.role !== 'FAMILY_MEMBER') {
      throw new UnauthorizedException(
        'This endpoint is only for family members.',
      );
    }
    const response = await this.accountService.getFamilyMemberAccounts(
      currentUser.id,
    );
    return response;
  }
}
