import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GroqService {
  private groq: Groq;
  //Dependency Injection
  constructor(private readonly config: ConfigService) {
    this.groq = new Groq({
      apiKey: this.config.get<string>('GROQ_API_KEY') || '',
    });
  }
  getGroq(): Groq {
    return this.groq;
  }
}
