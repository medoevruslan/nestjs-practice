import { Injectable } from '@nestjs/common';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
  seconds,
} from '@nestjs/throttler';

@Injectable()
export class RateLimitConfig implements ThrottlerOptionsFactory {
  createThrottlerOptions():
    Promise<ThrottlerModuleOptions> | ThrottlerModuleOptions {
    return { throttlers: [{ ttl: seconds(10), limit: 5 }] };
  }
}
