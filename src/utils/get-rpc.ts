import { fallback, http } from "viem";
import {
  bsc,
  bscTestnet,
  lens,
  lensTestnet
} from "viem/chains";
import type { FallbackTransport } from "viem";
import {
  BSC_MAINNET_RPCS,
  BSC_TESTNET_RPCS,
  LENS_MAINNET_RPCS,
  LENS_TESTNET_RPCS
} from "@/common/constants/rpcs";

const BATCH_SIZE = 10;

const getRpcsByChainId = (chainId: number): string[] => {
  switch (chainId) {
    case bsc.id:
      return BSC_MAINNET_RPCS;
    case bscTestnet.id:
      return BSC_TESTNET_RPCS;
    case lens.id:
      return LENS_MAINNET_RPCS;
    case lensTestnet.id:
      return LENS_TESTNET_RPCS;
    default:
      return [];
  }
}

const getRpcByChainId = (chainId: number): FallbackTransport => {
  const rpcs = getRpcsByChainId(chainId);
  return fallback(
    rpcs.map((rpc) => http(rpc, { batch: { batchSize: BATCH_SIZE } })),
    {
      rank: true,
      retryCount: 3
    }
  );
};

export default getRpcByChainId;
