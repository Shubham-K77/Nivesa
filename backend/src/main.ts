/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { serve } from 'inngest/express';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import cookie from 'cookie-parser';
import cors from 'cors';
import { json, urlencoded } from 'express';
import { inngest } from './inngest/client';
import { getInngestFunctions } from './inngest/functions';
import { PrismaService } from './prisma/prisma.service';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { MailerService } from './mailer/mailer.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  //Increase payload size limit for base64 images
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  //Routing Config
  app.setGlobalPrefix('api/v1');
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    }),
  );
  app.use(cookie());
  // Inject Dependencies into inngest functions
  const logger = app.get(Logger);
  const appService = app.get(AppService);
  const prismaService = app.get(PrismaService);
  const whatsappService = app.get(WhatsappService);
  const mailerService = app.get(MailerService);
  // Get inngest functions with dependencies
  const inngestFunctions = getInngestFunctions({
    appService,
    logger,
    prismaService,
    whatsappService,
    mailerService,
  });
  // Register inngest endpoint
  app.use(
    '/api/inngest',
    serve({
      client: inngest,
      functions: inngestFunctions,
    }),
  );
  await app.listen(process.env.PORT ?? 3001);
  logger.log(`The app is running on port: ${process.env.PORT ?? 3001}`);
  console.log(`The app is running on port: ${process.env.PORT ?? 3001}`);
}

void bootstrap();
