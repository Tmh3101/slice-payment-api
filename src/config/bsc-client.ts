import { createPublicClient } from 'viem';
import { bsc } from 'viem/chains';
import getBscRpc from '@/utils/get-rpc';

export const publicClient = createPublicClient({
  chain: bsc,
  transport: getBscRpc(),
});