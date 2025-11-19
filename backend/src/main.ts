/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookie from 'cookie-parser';
import cors from 'cors';

async function bootstrap() {
  //Dynamic App Module For Arject
  const dynamicAppModule = await AppModule.registerAsync();
  const app = await NestFactory.create(dynamicAppModule);
  //Routing Config
  app.setGlobalPrefix('api/v1');
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    }),
  );
  app.use(cookie());
  await app.listen(process.env.PORT ?? 3001);
  console.log(`The app is running on the port: ${process.env.PORT}`);
}
bootstrap();
