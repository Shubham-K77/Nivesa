import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  Patch,
  Body,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import type { Request } from 'express';
import { UserLoginGuard } from 'src/guard/user.login.guard';
@Controller('budget')
export class BudgetController {
  //Dependency Injection
  constructor(private readonly budgetService: BudgetService) {}
  //Routes
  @Get('/:id')
  @UseGuards(UserLoginGuard)
  async getBudgetInfo(@Param('id') id: string, @Req() req: Request) {
    const currentUser = req['current_user'];
    if (!currentUser) {
      return;
    }
    const response = await this.budgetService.getBudget(
      id,
      currentUser.id,
      currentUser.role as 'USER' | 'FAMILY_MEMBER',
    );
    return response;
  }
  @Patch('/:id')
  @UseGuards(UserLoginGuard)
  async createBudget(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Req() req: Request,
  ) {
    const currentUser = req['current_user'];
    if (!currentUser) {
      return;
    }
    const response = await this.budgetService.updateBudget(
      id,
      currentUser?.id,
      amount,
    );
    return response;
  }

  // Family Budget Routes
  @Get('/family/members/:accountId')
  @UseGuards(UserLoginGuard)
  async getFamilyMembers(
    @Param('accountId') accountId: string,
    @Req() req: Request,
  ) {
    const currentUser = req['current_user'];
    if (!currentUser) {
      return;
    }
    const response = await this.budgetService.getFamilyMembersByAccount(
      accountId,
      currentUser.id,
    );
    return response;
  }

  @Get('/family/:familyMemberId')
  @UseGuards(UserLoginGuard)
  async getFamilyMemberBudget(
    @Param('familyMemberId') familyMemberId: string,
    @Req() req: Request,
  ) {
    const currentUser = req['current_user'];
    if (!currentUser) {
      return;
    }
    const response = await this.budgetService.getFamilyBudget(
      familyMemberId,
      currentUser.id,
    );
    return response;
  }

  @Patch('/family/:familyMemberId')
  @UseGuards(UserLoginGuard)
  async updateFamilyMemberBudget(
    @Param('familyMemberId') familyMemberId: string,
    @Body('amount') amount: number,
    @Req() req: Request,
  ) {
    const currentUser = req['current_user'];
    if (!currentUser) {
      return;
    }
    const response = await this.budgetService.updateFamilyBudget(
      familyMemberId,
      currentUser.id,
      amount,
    );
    return response;
  }
}
