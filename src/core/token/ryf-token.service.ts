import { erc20Abi, parseUnits, formatUnits } from 'viem';
import { Mutex } from 'async-mutex';
import { db } from '@/db';
import { transferSchema } from '@/db/schema';
import { lensPublicClient, lensWalletClient } from '@/config/clients';
import {
    TreasuryBalanceInsufficientException,
    TokenTransferException,
} from '@/exceptions';
import type { TokenTransferData } from '@/types/tokenTransfer.type';
import { LENS_RYF_TOKEN } from '@/common/constants/lensChain-token';
import { logger } from '@/utils/logger';

const transferMutex = new Mutex();

const createSimulatedTransfer = async (transferData: TokenTransferData) => {
    const { amount, toAddress } = transferData;
    try {
        logger.info(`[TokenService] Preparing to send ${Number(amount)} ${LENS_RYF_TOKEN.symbol} to ${toAddress}...`);
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
            logger.error(`[TokenService] Treasury balance insufficient: Have ${formatUnits(adminBalance, LENS_RYF_TOKEN.decimals)} ${LENS_RYF_TOKEN.symbol}, Need ${formatUnits(amountWei, LENS_RYF_TOKEN.decimals)} ${LENS_RYF_TOKEN.symbol}`);
            throw new TreasuryBalanceInsufficientException('Treasury balance insufficient');
        }

        logger.info(`[TokenService] Treasury balance sufficient: ${formatUnits(adminBalance, LENS_RYF_TOKEN.decimals)} ${LENS_RYF_TOKEN.symbol}`);

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
        return request;
    } catch (error: any) {
        logger.error({ error: error.message }, '[TokenService] Simulation failed');
        throw new TokenTransferException(
            `Simulated transfer to ${toAddress} failed: ${error.shortMessage || error.message}`
        );
    }
};

const transferTokenToUser = async (transferData: TokenTransferData, request?: any) => {
    return await transferMutex.runExclusive(async () => {
        const { orderId, amount, toAddress } = transferData;
        logger.info(`[TokenService] Locked wallet for Order ${orderId}`);

        try {
            if (!request) {
                request = await createSimulatedTransfer({
                    amount,
                    toAddress,
                    orderId
                });
            }

            // Gửi Transaction (Write Contract)
            const hash = await lensWalletClient.writeContract(request);
            logger.info(`[TokenService] Transaction Sent! Hash: ${hash}`);

            const receipt = await lensPublicClient.waitForTransactionReceipt({ hash });
            if (receipt.status !== 'success') {
                throw new TokenTransferException('Transaction Failed on Blockchain');
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
            logger.error({ detail: error }, '[TokenService] Transfer Failed');
            if (error instanceof TokenTransferException || error instanceof TreasuryBalanceInsufficientException) {
                throw error;
            }
            throw new TokenTransferException(
                `Transfer to ${toAddress} failed: ${error.shortMessage || error.message}`
            );
        } finally {
            logger.info(`[TokenService] Unlocked wallet after Order ${orderId}`);
        }
    });
};

export const ryfTokenService = {
    createSimulatedTransfer,
    transferTokenToUser,
};