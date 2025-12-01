import { envConfig } from "@/config/env";

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

const USDT = {
    mainnet: {
        name: "Tether USD",
        symbol: "USDT",
        address: "0x55d398326f99059fF775485246999027B3197955",
        decimals: 18,
    },
    testnet: {
        name: "USDT Token",
        symbol: "USDT",
        address: "0x7393b10Ed9BCD68a72a841d9CF8c753c1A92A726",
        decimals: 18,
    }
}

const VNDC = {
    mainnet: {
        name: "VNDC Token",
        symbol: "VNDC",
        address: "0xDDE5B33a56f3F1C22e5a6bd8429E6ad508BFF24E",
        decimals: 0,
    },
    testnet: {
        name: "VNDC Token",
        symbol: "VNDC",
        address: "0x63439b511170a735ff1fea9b38f71c57e67ccbd9",
        decimals: 0,
    }
};

export const RYF_TOKEN = envConfig.IS_MAINNET ? RYF.mainnet : RYF.testnet;
export const USDT_TOKEN = envConfig.IS_MAINNET ? USDT.mainnet : USDT.testnet;
export const VNDC_TOKEN = envConfig.IS_MAINNET ? VNDC.mainnet : VNDC.testnet;