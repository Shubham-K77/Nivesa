import { Module } from '@nestjs/common';
import { GroqService } from './groq.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [GroqService],
  exports: [GroqService],
})
export class GroqModule {}
