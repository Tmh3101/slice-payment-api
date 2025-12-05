import Moralis from 'moralis';
import redis from '@/lib/redis';
import { bsc } from 'viem/chains';
import { envConfig } from '@/config/env';
import { logger } from '@/utils/logger';
import {
    CACHE_TTL,
    FALLBACK_PRICE
} from '@/common/constants/price';

const setExpiry = async (key: string, price: number, ttlSeconds: number) => {
    const redisClient = redis as any;
    if (envConfig.IS_USE_UPSTASH_REDIS) {
        await redisClient.set(key, price, { ex: ttlSeconds });
    } else {
        await redisClient.set(key, price, 'EX', ttlSeconds);
    }
};

export const getTokenPriceUsd = async (tokenAddress: string, symbol: string): Promise<number> => {
    const cacheKey = `price:${tokenAddress.toLowerCase()}`;

    // Kiểm tra Cache Redis
    try {
        const cachedPrice = await redis.get<number>(cacheKey);
        if (cachedPrice) {
            logger.info(`[Price] Cache Hit for ${symbol}: $${cachedPrice}`);
            return Number(cachedPrice);
        }
    } catch (e) {
        logger.error(`[Price] Redis Error reading ${symbol}`);
    }

    try {
        if (!Moralis.Core.isStarted) {
            await Moralis.start({ apiKey: envConfig.MORALIS_API_KEY });
        }

        const response = await Moralis.EvmApi.token.getTokenPrice({ 
            chain: bsc.id,
            address: tokenAddress,
        });

        const price = response.raw.usdPrice;
        logger.info(`[Price] Moralis Fetched ${symbol}: $${price}`);

        await setExpiry(cacheKey, price, CACHE_TTL);
        return price;
    } catch (error: any) {
        logger.warn({ msg: error.message }, `[Price] Moralis failed for ${symbol}. Using Fallback.`);
        if (symbol === 'RYF') return FALLBACK_PRICE.RYF;
        if (symbol === 'VNDC') return FALLBACK_PRICE.VNDC;
        return 0;
    }
};