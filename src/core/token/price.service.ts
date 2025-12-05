import Moralis from 'moralis';
import redis from '@/lib/redis';
import { bsc } from 'viem/chains';
import { envConfig } from '@/config/env';
import { logger } from '@/utils/logger';
import {
    CACHE_TTL,
    FALLBACK_PRICE
} from '@/common/constants/price';

export const getTokenPriceUsd = async (tokenAddress: string, symbol: string): Promise<number> => {
    const cacheKey = `price:${tokenAddress.toLowerCase()}`;

    // Kiểm tra Cache Redis
    try {
        const cachedPrice = await redis.get(cacheKey);
        if (cachedPrice) {
            logger.info(`[Price] Cache Hit for ${symbol}: $${cachedPrice}`);
            return Number(cachedPrice);
        }
    } catch (e) {
        logger.error(`[Price] Redis Error reading ${symbol}`);
    }

    // Gọi Moralis API
    try {
        // Đảm bảo Moralis đã start (gọi lại cho chắc)
        if (!Moralis.Core.isStarted) {
            await Moralis.start({ apiKey: envConfig.MORALIS_API_KEY });
        }

        const response = await Moralis.EvmApi.token.getTokenPrice({ 
            chain: bsc.id,
            address: tokenAddress,
        });

        const price = response.raw.usdPrice;
        logger.info(`[Price] Moralis Fetched ${symbol}: $${price}`);

        // Lưu vào Redis (Set Expiry)
        await redis.set(cacheKey, price, 'EX', CACHE_TTL);

        return price;
    } catch (error: any) {
        logger.warn({ msg: error.message }, `[Price] Moralis failed for ${symbol}. Using Fallback.`);
        
        // Fallback (Dùng giá cứng) - Nếu là RYF hoặc VNDC thì lấy giá cứng, còn lại trả về 0
        if (symbol === 'RYF') return FALLBACK_PRICE.RYF;
        if (symbol === 'VNDC') return FALLBACK_PRICE.VNDC;
        return 0;
    }
};