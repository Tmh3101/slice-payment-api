import Moralis from 'moralis';
import { envConfig } from '@/config/env';
import { logger } from '../utils/logger';

let isStarted = false;

export const initMoralis = async () => {
    if (isStarted) return;

    try {
        await Moralis.start({
            apiKey: envConfig.MORALIS_API_KEY,
        });

        isStarted = true;
        logger.info('[Moralis] Initialized successfully');
    } catch (error) {
        logger.error({ error }, '[Moralis] Init Failed');
    }
};