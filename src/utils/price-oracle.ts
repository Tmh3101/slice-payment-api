import { parseUnits } from 'viem';
import { RYF, USDT, VNDC } from '@/common/constants/bsc-token';
import { logger } from '@/utils/logger';

interface DexScreenerResponse {
    pairs: {
        priceUsd: string;
        baseToken: { address: string; symbol: string };
        quoteToken: { address: string; symbol: string };
        liquidity?: { usd: number };
    }[];
}

const getTokenByCurrency = (currency: string) => {
    if (currency.toUpperCase() === 'USDT') return USDT.mainnet;
    return VNDC.mainnet;
};

const DEXSCREENER_API_URL = 'https://api.dexscreener.com/latest/dex/tokens';
const SIGNAL_TIMEOUT_MS = 5000;
const FALLBACK_VNDC_USD_RATE = 27000; // 1 USD = 27,000 VNDC

const getPriceUsdFromDexScreener = async (address: string): Promise<number> => {
    try {
        const res = await fetch(
            `${DEXSCREENER_API_URL}/${address}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(SIGNAL_TIMEOUT_MS)
            }
        );

        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);

        const data = (await res.json()) as DexScreenerResponse;
        const pairs = data.pairs || [];
        if (pairs.length === 0) return 0;

        // Sắp xếp lấy cặp có thanh khoản USD cao nhất để giá chuẩn nhất
        pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
        const bestPair = pairs[0];
        const price = parseFloat(bestPair.priceUsd);
        
        return isNaN(price) ? 0 : price;
    } catch (error) {
        logger.error({ address, error }, 'Failed to fetch DexScreener Price');
        return 0;
    }
};

export const getPaymentAmount = async (amountRYF: string, currency: string) => {
    const paymentToken = getTokenByCurrency(currency);
    const isVNDC = currency.toUpperCase() === 'VNDC';

    logger.info(`[Oracle API] Calculating: ${amountRYF} RYF -> ${currency}`);
    try {
        const ryfPriceUsd = await getPriceUsdFromDexScreener(RYF.mainnet.address);
        
        if (ryfPriceUsd === 0) {
            throw new Error('Unable to fetch RYF price from DexScreener.');
        }

        let rateToPaymentToken = 1;
        if (isVNDC) {
            const vndcPriceUsd = await getPriceUsdFromDexScreener(VNDC.mainnet.address);
            if (vndcPriceUsd === 0) {
                logger.warn('API VNDC failed, using fallback rate 27,000');
                rateToPaymentToken = FALLBACK_VNDC_USD_RATE; 
            } else {
                rateToPaymentToken = 1 / vndcPriceUsd;
            }
        }

        const totalUsdNeeded = Number(amountRYF) * ryfPriceUsd;
        const totalPay = totalUsdNeeded * rateToPaymentToken;
        const finalRate = totalPay / Number(amountRYF);

        const displayDecimals = isVNDC ? 0 : 6;
        const formattedTotal = totalPay.toFixed(displayDecimals);
        const rawAmountIn = parseUnits(totalPay.toFixed(paymentToken.decimals), paymentToken.decimals);

        logger.info(`   > Price Ref: 1 RYF = $${ryfPriceUsd} ${isVNDC ? `= ${(1 / ryfPriceUsd * rateToPaymentToken).toFixed(2)} VNDC` : ''}`);
        logger.info(`   > Final Bill: ${amountRYF} RYF = ${formattedTotal} ${currency}`);

        return {
            rawAmountIn: rawAmountIn,
            formattedAmountIn: formattedTotal,
            rate: finalRate,
            currency: currency
        };
    } catch (error: any) {
        logger.error({ detail: error.message }, 'Price Oracle Error');
        throw new Error('Failed to get payment amount from price oracle.');
    }
};