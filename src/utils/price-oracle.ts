import { parseUnits } from 'viem';
import { RYF, USDT, VNDC } from '@/common/constants/bsc-token';
import { logger } from '@/utils/logger';
import { getTokenPriceUsd } from '@/core/token/price.service';
import { FALLBACK_VNDC_USD_RATE } from '@/common/constants/price';

const getTokenByCurrency = (currency: string) => {
    if (currency.toUpperCase() === 'USDT') return USDT.mainnet;
    return VNDC.mainnet;
};

export const getPaymentAmount = async (amountRYF: string, currency: string) => {
    const paymentToken = getTokenByCurrency(currency);
    const isVNDC = currency.toUpperCase() === 'VNDC';

    logger.info(`[Oracle] Calculating: ${amountRYF} RYF -> ${currency}`);

    try {
        const ryfPriceUsd = await getTokenPriceUsd(
            RYF.mainnet.address,
            RYF.mainnet.symbol
        );

        let rateToPaymentToken = 1;
        if (isVNDC) {
            const vndcPriceUsd = await getTokenPriceUsd(
                VNDC.mainnet.address,
                VNDC.mainnet.symbol
            );
            
            if (vndcPriceUsd > 0) {
                rateToPaymentToken = 1 / vndcPriceUsd;
            } else {
                rateToPaymentToken = FALLBACK_VNDC_USD_RATE; // Fallback cuối cùng
            }
        }

        const totalUsdNeeded = Number(amountRYF) * ryfPriceUsd;
        const totalPay = totalUsdNeeded * rateToPaymentToken;

        const finalRate = totalPay / Number(amountRYF);
        const displayDecimals = isVNDC ? 0 : 6;
        const formattedTotal = totalPay.toFixed(displayDecimals);
        const rawAmountIn = parseUnits(totalPay.toFixed(paymentToken.decimals), paymentToken.decimals);

        logger.info(`   > 1 RYF = $${ryfPriceUsd}`);
        logger.info(`   > Total: ${formattedTotal} ${currency}`);

        return {
            rawAmountIn,
            formattedAmountIn: formattedTotal,
            rate: finalRate,
            currency
        };

    } catch (error: any) {
        logger.error({ err: error.message }, 'Price Oracle System Error');
        throw new Error('Hệ thống tính giá đang bảo trì.');
    }
};