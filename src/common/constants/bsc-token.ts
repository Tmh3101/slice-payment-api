import { envConfig } from "@/config/env";

export const RYF = {
    mainnet: {
        name: "Rise Your Future",
        symbol: "RYF",
        address: "0xF9965785630FFC1AE6F1D1EDB7339c1Fe4FAEaa5",
        decimals: 18,
    },
    testnet: {
        name: "Testnet Rise Your Future",
        symbol: "tRYF",
        address: "0x296fEF759bD54328236b8877Dad24e7aB70a1BC4",
        decimals: 18,
    }
}

export const USDT = {
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

export const VNDC = {
    mainnet: {
        name: "VNDC Token",
        symbol: "VNDC",
        address: "0xDDE5B33a56f3F1C22e5a6bd8429E6ad508BFF24E",
        decimals: 0,
    },
    testnet: {
        name: "VNDC Token",
        symbol: "VNDC",
        address: "0x63439B511170A735ff1fEA9b38f71C57E67cCBd9",
        decimals: 0,
    }
};

export const WBNB = {
    mainnet: {
        name: "Wrapped BNB",
        symbol: "WBNB",
        address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        decimals: 18,
    },
}

export const RYF_TOKEN = envConfig.IS_MAINNET ? RYF.mainnet : RYF.testnet;
export const USDT_TOKEN = envConfig.IS_MAINNET ? USDT.mainnet : USDT.testnet;
export const VNDC_TOKEN = envConfig.IS_MAINNET ? VNDC.mainnet : VNDC.testnet;