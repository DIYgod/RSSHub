import { config } from '@/config';
import logger from '@/utils/logger';
import md5 from '@/utils/md5';

import type CacheModule from './base';

type CacheHitResponse = {
    hit: true;
    value: string;
};

const status = { available: false };

let baseUrl: string | undefined;
let apiToken: string | undefined;

const toRemoteKey = (key: string) => `rsshub:http-cache:${md5(key)}`;

const cacheUrl = (key: string, refresh = false) => {
    const url = `${baseUrl}/v1/cache/${encodeURIComponent(toRemoteKey(key))}`;
    return refresh ? `${url}?refresh=1` : url;
};

const requestSignal = () => (typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(config.requestTimeout) : undefined);

const request = async (url: string, init: Omit<RequestInit, 'headers'> = {}, headers: Record<string, string> = {}) => {
    if (!status.available || !apiToken) {
        return null;
    }

    try {
        return await fetch(url, {
            ...init,
            headers: {
                authorization: `Bearer ${apiToken}`,
                ...headers,
            },
            signal: requestSignal(),
        });
    } catch (error) {
        logger.error('HTTP cache request failed:', error);
        return null;
    }
};

const readResponseText = async (response: Response) => {
    try {
        return await response.text();
    } catch {
        return '';
    }
};

const readCacheHitResponse = async (response: Response) => {
    try {
        return (await response.json()) as CacheHitResponse;
    } catch {
        return null;
    }
};

const logUnexpectedResponse = async (operation: string, response: Response) => {
    const message = await readResponseText(response);
    logger.error(`HTTP cache ${operation} failed with status ${response.status}${message ? `: ${message}` : ''}`);

    if (response.status === 401) {
        status.available = false;
    }
};

export default {
    init: () => {
        baseUrl = config.httpCache.url?.replace(/\/+$/, '');
        apiToken = config.httpCache.token;

        if (!baseUrl || !apiToken) {
            status.available = false;
            logger.error('HTTP cache requires CACHE_HTTP_URL and CACHE_HTTP_TOKEN.');
            return;
        }

        try {
            new URL(baseUrl);
        } catch {
            status.available = false;
            logger.error('HTTP cache URL is invalid.');
            return;
        }

        status.available = true;
        logger.info('HTTP cache configured.');
    },
    get: async (key: string, refresh = true) => {
        if (!key) {
            return null;
        }

        const response = await request(cacheUrl(key, refresh), { method: 'GET' });
        if (!response) {
            return null;
        }

        if (response.status === 404) {
            return '';
        }

        if (!response.ok) {
            await logUnexpectedResponse('get', response);
            return null;
        }

        const data = await readCacheHitResponse(response);
        if (data?.hit === true && typeof data.value === 'string') {
            return data.value;
        }

        logger.error('HTTP cache get returned an invalid response.');
        return null;
    },
    has: async (key: string) => {
        if (!key) {
            return false;
        }

        const response = await request(cacheUrl(key), { method: 'HEAD' });
        if (!response) {
            return false;
        }

        if (response.status === 204) {
            return true;
        }

        if (response.status === 404) {
            return false;
        }

        await logUnexpectedResponse('has', response);
        return false;
    },
    set: async (key: string, value?: string | Record<string, any>, maxAge = config.cache.contentExpire) => {
        if (!key) {
            return;
        }

        if (!value || value === 'undefined') {
            value = '';
        }
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }

        const response = await request(
            cacheUrl(key),
            {
                method: 'PUT',
                body: JSON.stringify({
                    ttl: maxAge,
                    value,
                }),
            },
            {
                'content-type': 'application/json',
            }
        );

        if (response && response.status !== 204) {
            await logUnexpectedResponse('set', response);
        }
    },
    clients: {},
    status,
} as CacheModule;
