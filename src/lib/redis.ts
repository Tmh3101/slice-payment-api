import Redis from 'ioredis';
import { envConfig } from '@/config/env';
import { logger } from '../utils/logger';

const redis = new Redis({
  host: envConfig.REDIS_HOST,
  port: envConfig.REDIS_PORT,
  
  // Retry strategy: Tự động kết nối lại nếu rớt mạng
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => logger.info('[Redis] Connected'));
redis.on('error', (err) => logger.error({ err }, '[Redis] Error'));

export default redis;