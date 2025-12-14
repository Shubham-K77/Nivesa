/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';

interface currentUserData {
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
  imageUrl?: string;
  role: string;
}

@Injectable()
export class RestrictFamilyMemberGuard implements CanActivate {
  //Dependency Injection
  //Function for guard
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const loggedInUserInfo: currentUserData = request['current_user'];
      if (!loggedInUserInfo) {
        throw new UnauthorizedException(
          'Must be loggedin to access this request',
        );
      }
      if (loggedInUserInfo.role !== 'USER') {
        //Only two roles currently: USER and FAMILY_MEMBER
        throw new UnauthorizedException(
          'The family member is not allowed to access this request!',
        );
      }
      return Promise.resolve(true);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException(
        'Must be a user logged into the system not a family member',
      );
    }
  }
}
