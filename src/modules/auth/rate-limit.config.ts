import { Injectable } from '@nestjs/common';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';

@Injectable()
export class RateLimitConfig implements ThrottlerOptionsFactory {
  createThrottlerOptions():
    Promise<ThrottlerModuleOptions> | ThrottlerModuleOptions {
    return { throttlers: [{ ttl: 10000, limit: 5 }] };
  }
}
