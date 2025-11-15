import { Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private redis: Redis;
  //Auto Config Redis When Calling The Service
  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      url: this.configService.get<string>('UPSTASH_REDIS_REST_URL'),
      token: this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN'),
    });
  }
  //Redis Get Function
  async get(key: string): Promise<any> {
    const value = await this.redis.get(key);
    return value;
  }
  //Redis Set Function
  async set(key: string, value: any, options?: { ttl?: number }): Promise<any> {
    if (options?.ttl) {
      return this.redis.set(key, value, { ex: options.ttl });
    }
    return this.redis.set(key, value);
  }
  //Redis Delete Function
  async del(key: string): Promise<any> {
    return this.redis.del(key);
  }
}
