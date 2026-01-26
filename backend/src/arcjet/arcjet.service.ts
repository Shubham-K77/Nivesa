/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ArcjetService implements OnModuleInit {
  private readonly logger = new Logger(ArcjetService.name);
  private arcjet: any;
  private tokenBucket: any;
  constructor(private configService: ConfigService) {}
  async onModuleInit() {
    try {
      const arcjetModule = await import('@arcjet/node');
      this.tokenBucket = arcjetModule.tokenBucket;
      this.arcjet = arcjetModule.default({
        key: this.configService.get<string>('ARCJET_KEY')!,
        characteristics: ['userId'],
        rules: [
          arcjetModule.tokenBucket({
            mode: 'LIVE',
            refillRate: 10,
            interval: '1h',
            capacity: 10,
          }),
        ],
      });
      this.logger.log('Arcjet initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Arcjet', error);
      throw error;
    }
  }
  async protect(req: any, context: any) {
    if (!this.arcjet) {
      throw new Error('Arcjet not initialized');
    }
    return this.arcjet.protect(req, context);
  }
  isInitialized(): boolean {
    return !!this.arcjet;
  }
}
