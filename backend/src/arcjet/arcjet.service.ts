/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ArcjetService implements OnModuleInit {
  private readonly logger = new Logger(ArcjetService.name);
  private arcjet: any;
  constructor(private configService: ConfigService) {}
  async onModuleInit() {
    try {
      const arcjetModule = await import('@arcjet/node');
      this.arcjet = arcjetModule.default({
        key: this.configService.get<string>('ARCJET_KEY')!,
        characteristics: ['userId'],
        rules: [
          // 1. Shield: blocks SQLi, XSS, path traversal, shell injection, etc.
          arcjetModule.shield({
            mode: 'DRY_RUN',
          }),
          // 2. Bot protection: block automated/headless clients, allow verified bots
          arcjetModule.detectBot({
            mode: 'DRY_RUN',
            allow: [
              'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc.
              'CATEGORY:MONITOR', // Uptime monitors
              'CATEGORY:PREVIEW', // Link preview bots (Slack, etc.)
            ],
          }),
          // 3. Token bucket rate limiter: 10 requests / hour per userId
          arcjetModule.tokenBucket({
            mode: 'DRY_RUN',
            refillRate: 10,
            interval: '1h',
            capacity: 10,
          }),
        ],
      });
      this.logger.log(
        'Arcjet initialized in DRY_RUN mode (shield + bot detection + rate limit)',
      );
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
