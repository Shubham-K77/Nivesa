import {
  Controller,
  Get,
  UseGuards,
  Post,
  Body,
  ServiceUnavailableException,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { UserLoginGuard } from 'src/guard/user.login.guard';
import { RestrictFamilyMemberGuard } from 'src/guard/restrict-familyMember.guard';

@Controller('whatsapp')
export class WhatsappController {
  //Dependency Injection
  constructor(private readonly whatsappService: WhatsappService) {}
  //Get Requests
  @Get('qr')
  @UseGuards(UserLoginGuard, RestrictFamilyMemberGuard)
  async getQrCode() {
    const response = await this.whatsappService.scanAndLogin();
    if (!response.success) {
      throw new ServiceUnavailableException('Unable to login at the moment!');
    }
    return {
      success: true,
      message: response.message,
      qrCode: response.qrCode,
      instruction: 'Scan the QR code shown in terminal with your WhatsApp',
    };
  }
  @Get('status')
  @UseGuards(UserLoginGuard, RestrictFamilyMemberGuard)
  getStatus() {
    const response = this.whatsappService.getLoginStatus();
    return {
      isLoggedIn: response.isLoggedIn,
      qrCode: response.qrCode,
      message: response.isLoggedIn
        ? 'WhatsApp is connected'
        : response.qrCode
          ? 'QR code available - please scan to login'
          : 'Not connected - call /qr endpoint to generate QR code',
    };
  }
  //Post Requests
  @Post('send')
  @UseGuards(UserLoginGuard, RestrictFamilyMemberGuard)
  async sendMessage(@Body() info: { phoneNumber: string; message: string }) {
    const response = await this.whatsappService.sendMessage(
      info.phoneNumber,
      info.message,
    );
    if (!response.success) {
      throw new ServiceUnavailableException(
        'Unable to send the message at the moment!',
      );
    }
    return {
      success: true,
      message: response.message,
    };
  }
  @Post('unlink')
  @UseGuards(UserLoginGuard, RestrictFamilyMemberGuard)
  async unlinkDevice() {
    const response = await this.whatsappService.unlinkDevice();
    if (!response) {
      throw new ServiceUnavailableException('Unable to logout from the device');
    }
    return {
      message: 'Successfully Unlinked!',
      statusCode: 200,
    };
  }
}
