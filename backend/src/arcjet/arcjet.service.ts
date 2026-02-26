/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-implied-eval */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ArcjetService implements OnModuleInit {
  private readonly logger = new Logger(ArcjetService.name);
  private arcjet: any;
  constructor(private configService: ConfigService) {}
  async onModuleInit() {
    try {
      // Force ESM dynamic import to work in CommonJS
      const {
        default: arcjet,
        shield,
        detectBot,
        tokenBucket,
      } = await Function('return import("@arcjet/node")')();

      this.arcjet = arcjet({
        key: this.configService.get<string>('ARCJET_KEY')!,
        characteristics: ['userId'],
        rules: [
          shield({ mode: 'DRY_RUN' }),
          detectBot({
            mode: 'DRY_RUN',
            allow: [
              'CATEGORY:SEARCH_ENGINE',
              'CATEGORY:MONITOR',
              'CATEGORY:PREVIEW',
            ],
          }),
          tokenBucket({
            mode: 'DRY_RUN',
            refillRate: 10,
            interval: '1h',
            capacity: 10,
          }),
        ],
      });
      this.logger.log('Arcjet initialized in DRY_RUN mode');
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
