import { erc20Abi, parseUnits } from 'viem';
import { lensPublicClient, lensWalletClient } from '@/config/clients';
import { LENS_RYF_TOKEN } from '@/common/constants/lensChain-token';
import {
    TreasuryBalanceInsufficientException,
    TokenTransferFailedException
} from '@/exceptions/treasury.exception';
import { db } from '@/db';
import { transferSchema } from '@/db/schema';
import type { TokenTransferData } from '@/types/tokenTransfer.type';
import { logger } from '@/utils/logger';

const transferTokenToUser = async (transferData: TokenTransferData) => {
    const { orderId, amount, toAddress } = transferData;
    try {
        logger.info(`[TokenService] Preparing to send ${amount} RYF to ${toAddress}...`);
        const amountWei = parseUnits(amount, LENS_RYF_TOKEN.decimals);

        const adminBalance = await lensPublicClient.readContract({
            address: LENS_RYF_TOKEN.address as `0x${string}`,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [
                lensWalletClient.account.address as `0x${string}`
            ]
        });

        if (adminBalance < amountWei) {
            throw new TreasuryBalanceInsufficientException(
                `Treasury balance insufficient: Have ${adminBalance.toString()}, Need ${amountWei.toString()}`
            );
        }

        // Giúp phát hiện lỗi (hết gas, lỗi contract) trước khi gửi thật
        const { request } = await lensPublicClient.simulateContract({
            account: lensWalletClient.account,
            address: LENS_RYF_TOKEN.address as `0x${string}`,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [
                toAddress as `0x${string}`,
                amountWei
            ],
        });

        // Gửi Transaction (Write Contract)
        const hash = await lensWalletClient.writeContract(request);
        logger.info(`[TokenService] Transaction Sent! Hash: ${hash}`);

        const receipt = await lensPublicClient.waitForTransactionReceipt({ hash });
        if (receipt.status !== 'success') {
            throw new TokenTransferFailedException('Transaction Failed on Blockchain');
        }

        const transferData = {
            orderId,
            txHash: hash,
            blockNumber: receipt.blockNumber.toString(),
        }

        logger.info(`[TokenService] Transfer Success! Block: ${transferData.blockNumber}`);

        // Lưu thông tin transfer vào DB
        await db.insert(transferSchema).values(transferData);
        return transferData;
    } catch (error: any) {
        logger.error({ error: error.message }, '[TokenService] Transfer Failed');
        throw new TokenTransferFailedException(
            `Transfer to ${toAddress} failed: ${error.shortMessage || error.message}`
        );
    }
};

export const ryfTokenService = {
    transferTokenToUser,
};