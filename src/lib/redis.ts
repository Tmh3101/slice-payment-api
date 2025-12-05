import Redis from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';
import { envConfig } from '@/config/env';
import { logger } from '../utils/logger';

const initRedis = () => {
    if (envConfig.IS_USE_UPSTASH_REDIS) {
        if (!envConfig.UPSTASH_REDIS_REST_URL || !envConfig.UPSTASH_REDIS_REST_TOKEN) {
            throw new Error('Upstash Redis configuration is missing');
        }
        return new UpstashRedis({
            url: envConfig.UPSTASH_REDIS_REST_URL,
            token: envConfig.UPSTASH_REDIS_REST_TOKEN,
        })
    }

    const redis = new Redis({
        host: envConfig.REDIS_HOST, 
        port: envConfig.REDIS_PORT,
    });

    redis.on('connect', () => logger.info('[Redis] Connected'));
    redis.on('error', (err) => logger.error({ err }, '[Redis] Error'));

    return redis;
}

const redis = initRedis();
export default redis;
