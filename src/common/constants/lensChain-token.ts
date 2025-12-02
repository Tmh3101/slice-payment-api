import { envConfig } from "@/config/env"

const RYF = {
    mainnet: {
        name: "Rise Your Future",
        symbol: "RYF",
        address: "0x93198F5e56443286b50Cf749dFb6A27f251aA630",
        decimals: 18,
    },
    testnet: {
        name: "Testnet Rise Your Future",
        symbol: "tRYF",
        address: "0x7326D8584c6b891B2f4B194CDF5ba746dD0D4080",
        decimals: 18,
    }
}

export const LENS_RYF_TOKEN = envConfig.IS_MAINNET ? RYF.mainnet : RYF.testnet;
