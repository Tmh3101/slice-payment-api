import { parseUnits } from 'viem';
import { RYF, USDT, VNDC } from '@/common/constants/bsc-token';
import {
    GECKO_API_URL,
    SIGNAL_TIMEOUT_MS,
    FALLBACK_VNDC_USD_RATE
} from '@/common/constants/oracle';
import { logger } from '@/utils/logger';

interface GeckoTerminalResponse {
    data: {
        id: string;
        type: string;
        attributes: {
            name: string;
            symbol: string;
            decimals: number;
            price_usd: string | null;
        };
    };
}

const getTokenByCurrency = (currency: string) => {
    if (currency.toUpperCase() === 'USDT') return USDT.mainnet;
    return VNDC.mainnet;
};

const getPriceUsdFromGecko = async (address: string): Promise<number> => {
    try {
        const url = `${GECKO_API_URL}/${address}`;
        const res = await fetch(url, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(SIGNAL_TIMEOUT_MS)
        });

        if (!res.ok) {
            logger.warn(`Gecko API returned status: ${res.status} for ${address}`);
            return 0;
        }

        const json = (await res.json()) as GeckoTerminalResponse;
        const priceString = json.data?.attributes?.price_usd;
        if (!priceString) return 0;

        const price = parseFloat(priceString);
        return isNaN(price) ? 0 : price;
    } catch (error) {
        logger.error({ address, error }, 'Failed to fetch GeckoTerminal Price');
        return 0;
    }
};

export const getPaymentAmount = async (amountRYF: string, currency: string) => {
    const paymentToken = getTokenByCurrency(currency);
    const isVNDC = currency.toUpperCase() === 'VNDC';

    logger.info(`[Oracle Gecko] Calculating: ${amountRYF} RYF -> ${currency}`);

    try {
        const ryfPriceUsd = await getPriceUsdFromGecko(RYF.mainnet.address);
        
        if (ryfPriceUsd === 0) {
            throw new Error('Unable to fetch RYF price from GeckoTerminal.');
        }

        let rateToPaymentToken = 1; // Mặc định USDT = 1 USD
        if (isVNDC) {
            const vndcPriceUsd = await getPriceUsdFromGecko(VNDC.mainnet.address);
            if (vndcPriceUsd === 0) {
                logger.warn('API VNDC failed, using fallback rate');
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
        const roundedTotalAmount = Math.round(Number(formattedTotal))

        logger.info(`   > Price Ref: 1 RYF = $${ryfPriceUsd}`);
        logger.info(`   > Final Bill: ${amountRYF} RYF = ${formattedTotal} ${currency}`);

        return {
            rawAmountIn: rawAmountIn,
            formattedAmountIn: formattedTotal,
            rate: finalRate,
            currency: currency,
            roundedTotalAmount
        };
    } catch (error: any) {
        logger.error({ detail: error.message }, 'Price Oracle Error');
        throw new Error('Failed to get payment amount from price oracle.');
    }
};