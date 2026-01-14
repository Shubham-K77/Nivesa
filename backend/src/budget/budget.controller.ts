import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
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
}
