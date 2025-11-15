import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  //Dynamic App Module For Arject
  const dynamicAppModule = await AppModule.registerAsync();
  const app = await NestFactory.create(dynamicAppModule);
  //Routing Config
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3001);
  console.log(`The app is running on the port: ${process.env.PORT}`);
}
bootstrap();
