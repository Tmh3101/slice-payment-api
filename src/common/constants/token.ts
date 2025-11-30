import { envConfig } from "@/config/env";

const RYF_TOKEN_MAINNET = {
    name: "Rise Your Future",
    symbol: "RYF",
    address: "0x93198F5e56443286b50Cf749dFb6A27f251aA630",
    decimals: 18,
}

const RYF_TOKEN_TESTNET = {
    name: "Testnet Rise Your Future",
    symbol: "tRYF",
    address: "0x7326D8584c6b891B2f4B194CDF5ba746dD0D4080",
    decimals: 18,
}

export const RYF_TOKEN = envConfig.IS_MAINNET ? RYF_TOKEN_MAINNET : RYF_TOKEN_TESTNET;