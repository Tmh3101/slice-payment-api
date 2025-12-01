import { parseUnits, formatUnits } from 'viem';
import { publicClient } from '@/config/bsc-client';
import { PANCAKE_ROUTER_V2_ADDRESS } from '@/common/constants/contracts';
import { ROUTER_ABI } from '@/common/abi/router-abi';
import { RYF_TOKEN, USDT_TOKEN, VNDC_TOKEN } from '@/common/constants/bsc-token';

const getTokenByCurrency = (currency: string) => {
    if (currency.toUpperCase() === 'USDT') {
        return USDT_TOKEN;
    }
    return VNDC_TOKEN;
};

export const getPaymentAmount = async (amountRYF: string, currency: string) => {
    try {
        const amountOutWei = parseUnits(amountRYF, RYF_TOKEN.decimals);
        const paymentToken = getTokenByCurrency(currency);
        
        // Xây dựng đường dẫn Swap (Path)
        // Nếu RYF và USDT có pool trực tiếp: [USDT, RYF]
        // Nếu không có pool trực tiếp mà qua BNB: [USDT, WBNB, RYF]
        // An toàn nhất thường là đi qua WBNB nếu thanh khoản nhỏ, nhưng giả sử có pool trực tiếp:
        const path = [paymentToken.address, RYF_TOKEN.address] as `0x${string}`[];

        // Gọi Smart Contract
        const data = await publicClient.readContract({
            address: PANCAKE_ROUTER_V2_ADDRESS,
            abi: ROUTER_ABI,
            functionName: 'getAmountsIn',
            args: [amountOutWei, path],
        });

        // data trả về mảng [amountIn, amountOut]
        // amountIn chính là số USDT cần phải trả
        const amountInWei = data[0];

        // Trả về Raw BigInt để lưu DB chính xác, và format string để log/hiển thị
        // USDT thường là 18 decimals trên BSC (check kỹ contract USDT bạn dùng)
        return {
            rawAmountIn: amountInWei, 
            formattedAmountIn: formatUnits(amountInWei, paymentToken.decimals), 
            rate: Number(formatUnits(amountInWei, paymentToken.decimals)) / Number(amountRYF) // Tỷ giá tham khảo 1 RYF = ? USDT
        };

    } catch (error) {
        throw new Error('Không thể lấy tỷ giá hiện tại từ Blockchain');
    }
};