import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis/redis.service';
//Arject
import {
  ArcjetGuard,
  ArcjetModule,
  detectBot,
  fixedWindow,
  shield,
} from '@arcjet/nest';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    //Env Config
    ConfigModule.forRoot({
      isGlobal: true, //Makes the env file accessible globally
    }),
    //Arcjet Config
    ArcjetModule.forRoot({
      isGlobal: true,
      key: process.env.ARJECT_KEY!,
      rules: [
        // Shield protects your app from common attacks e.g. SQL injection
        shield({ mode: 'LIVE' }),
        // Create a bot detection rule
        detectBot({
          mode: 'LIVE', // Blocks requests. Use "DRY_RUN" to log only
          // Block all bots except the following
          allow: [
            'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc
            // Uncomment to allow these other common bot categories
            // See the full list at https://arcjet.com/bot-list
            //"CATEGORY:MONITOR", // Uptime monitoring services
            //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
          ],
        }),
        // Create a fixed window rate limit. Other algorithms are supported.
        fixedWindow({
          mode: 'LIVE',
          window: '60s', // 10 second fixed window
          max: 2, // Allow a maximum of 2 requests
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
    PrismaService,
  ],
})
export class AppModule {}
