import { logger } from '@/utils/logger';

type RequestConfig = RequestInit & {
    params?: Record<string, string>;
};

export const httpClient = async <T>(
    url: string,
    config: RequestConfig = {}
): Promise<T> => {
    const { params, headers, ...rest } = config;

    const urlObj = new URL(url);
    if (params) {
        Object.entries(params).forEach(([key, value]) => urlObj.searchParams.append(key, value));
    }

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...headers,
    };

    try {
        const response = await fetch(urlObj.toString(), {
            headers: defaultHeaders,
            ...rest,
        });

        if (!response.ok) {
            const errorBody = await response.json();
            logger.error({ detail: errorBody }, `[HTTP Error] ${url}:`);
            throw new Error(errorBody.message || 'HTTP request failed');
        }

        return (await response.json()) as T;
    } catch (error) {
        throw error;
    }
};