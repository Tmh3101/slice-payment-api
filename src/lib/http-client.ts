import { HTTPException } from 'hono/http-exception';

type RequestConfig = RequestInit & {
    params?: Record<string, string>;
};

export const httpClient = async <T>(
    url: string,
    config: RequestConfig = {}
): Promise<T> => {
    const { params, headers, ...rest } = config;

    // Xử lý Query Params
    const urlObj = new URL(url);
    if (params) {
        Object.entries(params).forEach(([key, value]) => urlObj.searchParams.append(key, value));
    }

    // Mặc định Header
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
            // Xử lý lỗi từ phía 3rd party trả về
            const errorBody = await response.text();
            console.error(`[HTTP Error] ${url}:`, errorBody);
            
            throw new HTTPException(response.status as any, {
                message: `External API Error: ${response.statusText}`,
            });
        }

        // Tự động parse JSON
        return (await response.json()) as T;
    } catch (error) {
        if (error instanceof HTTPException) throw error;
        throw new HTTPException(500, { message: 'Failed to connect to third-party service' });
    }
};