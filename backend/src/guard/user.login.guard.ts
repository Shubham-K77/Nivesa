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
      //Get the Access Token First:
      const access_token = request.cookies['access_token'];
      if (access_token) {
        try {
          const payload = this.jwtService.verify(access_token, {
            secret: this.configService.get<string>('access_token_secret'),
          });
          request['current_user'] = payload;
          return true;
        } catch (error: any) {
          console.error(error.message);
        }
      }
      //Then Get The Refresh Token:
      const refresh_token = request.cookies['refresh_token'];
      if (!refresh_token) {
        throw new UnauthorizedException(
          'You must login to continue the request.',
        );
      }
      let refresh_payload;
      try {
        refresh_payload = this.jwtService.verify(refresh_token, {
          secret: this.configService.get<string>('refresh_token_secret'),
        });
      } catch (error: any) {
        console.error(error.message);
        throw new UnauthorizedException(
          'The token is already expired, please login again.',
        );
      }
      //Get The Appropriate Value
      const { exp, ...payload } = refresh_payload;
      // Access token missing/expired - generate new one from refresh token payload
      const newAccessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('access_token_secret'),
        expiresIn: '15m',
      });
      // Set new access token cookie
      const isProduction = process.env.NODE_ENV === 'production';
      await response.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000, //15 mins
      });
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
