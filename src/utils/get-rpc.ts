import { fallback, http } from "viem";
import type { FallbackTransport } from "viem";
import {
  BSC_MAINNET_RPCS,
  BSC_TESTNET_RPCS
} from "@/common/constants/rpcs";
import { envConfig } from "@/config/env";

const BATCH_SIZE = 10;

const getBscRpcs = (): string[] => {
    if (envConfig.IS_MAINNET) {
        return BSC_MAINNET_RPCS;
    }
    return BSC_TESTNET_RPCS;
}

const getBscRpc = (): FallbackTransport => {
  const rpcs = getBscRpcs();
  return fallback(
    rpcs.map((rpc) => http(rpc, { batch: { batchSize: BATCH_SIZE } })),
    {
      rank: true,
      retryCount: 3
    }
  );
};

export default getBscRpc;
