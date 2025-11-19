/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserLoginGuard implements CanActivate {
  //Dependency Injection:
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  //Function For Guard:
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //Request:
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    //Get The Http Only Cookies:
    try {
      //Get The Refresh Token First:
      const refresh_token = request.cookies['refresh_token'];
      if (!refresh_token) {
        throw new UnauthorizedException(
          'You must login to continue the request.',
        );
      }
      let isValid;
      try {
        isValid = this.jwtService.verify(refresh_token, {
          secret: this.configService.get<string>('refresh_token_secret'),
        });
      } catch (error: any) {
        console.error(error.message);
        throw new ServiceUnavailableException(
          'The token is already expired, please login again.',
        );
      }
      //Get The Appropriate Value
      const { exp, ...payload } = isValid;
      //Get The Access Token
      const access_token = request.cookies['access_token'];
      if (!access_token) {
        // Access token missing/expired - generate new one from refresh token payload
        const newAccessToken = this.jwtService.sign(payload, {
          secret: this.configService.get<string>('access_token_secret'),
          expiresIn: '15m',
        });
        // Set new access token cookie
        await response.cookie('access_token', newAccessToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000, //15 mins
        });
      }
      // Use refresh token payload since we just generated access token from it
      request['current_user'] = payload;
      return Promise.resolve(true);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error(error);
      throw new UnauthorizedException(
        'The token is already expired, please login again.',
      );
    }
  }
}
