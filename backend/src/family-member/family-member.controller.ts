import { Body, Controller, Post } from '@nestjs/common';
import { FamilyMemberService } from './family-member.service';

@Controller('familymember')
export class FamilyMemberController {
  //Dependency Injection:
  constructor(private readonly familyMemberService: FamilyMemberService) {}
  //Get Request:

  //Post Request:
  @Post('/')
  async validateMember(@Body() body: { token: string; newPassword: string }) {
    const response = await this.familyMemberService.validate({
      token: body.token,
      newPassword: body.newPassword,
    });
    return response;
  }
}
