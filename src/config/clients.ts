import { createPublicClient, createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  bsc,
  bscTestnet,
  lens,
  lensTestnet
} from 'viem/chains';
import getRpcByChainId from '@/utils/get-rpc';
import { envConfig } from '@/config/env';

const bscChain = envConfig.IS_MAINNET ? bsc : bscTestnet;
const lensChain = envConfig.IS_MAINNET ? lens : lensTestnet;

export const bscPublicClient = createPublicClient({
  chain: bscChain,
  transport: getRpcByChainId(bscChain.id),
});

export const lensPublicClient = createPublicClient({
  chain: lensChain,
  transport: getRpcByChainId(lensChain.id),
});

export const lensAdminAccount = privateKeyToAccount(
  envConfig.ADMIN_PRIVATE_KEY as `0x${string}`
);

export const lensWalletClient = createWalletClient({
  account: lensAdminAccount,
  chain: lensChain,
  transport: getRpcByChainId(lensChain.id),
});