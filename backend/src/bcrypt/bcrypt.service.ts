import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
@Injectable()
export class BcryptService {
  //Dependency Injection
  constructor(private readonly configService: ConfigService) {}
  //Creating Salt
  async genSalt(): Promise<string> {
    const salt = await bcrypt.genSalt(
      parseInt(this.configService.get<string>('ROUND') || '10'),
    );
    return salt;
  }
  //Encrypt The Password
  async encrypt(password: string): Promise<string> {
    const salt = await this.genSalt();
    const newPassword = await bcrypt.hash(password, salt);
    if (!newPassword) {
      console.log('Password Encryption Failed!');
    }
    return newPassword;
  }
  //Decrypt The Password
  async decrypt(password: string, hash: string): Promise<boolean> {
    const isValid = await bcrypt.compare(password, hash);
    if (!isValid) {
      console.log('Password provided was invalid!');
    }
    return isValid;
  }
}
