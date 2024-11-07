import { createFetch } from 'ofetch';
import { config } from '@/config';
import logger from '@/utils/logger';
import { register } from 'node-network-devtools';

config.enableRemoteDebugging && process.env.NODE_ENV === 'dev' && register();

const rofetch = createFetch().create({
    retryStatusCodes: [400, 408, 409, 425, 429, 500, 502, 503, 504],
    retry: config.requestRetry,
    retryDelay: 1000,
    // timeout: config.requestTimeout,
    onResponseError({ request, response, options }) {
        if (options.retry) {
            logger.warn(`Request ${request} with error ${response.status} remaining retry attempts: ${options.retry}`);
            if (!options.headers) {
                options.headers = {};
            }
            if (options.headers instanceof Headers) {
                options.headers.set('x-prefer-proxy', '1');
            } else {
                options.headers['x-prefer-proxy'] = '1';
            }
        }
    },
    onRequestError({ request, error }) {
        logger.error(`Request ${request} fail: ${error}`);
    },
    headers: {
        'user-agent': config.ua,
    },
    onResponse({ request, response }) {
        if (response.redirected) {
            logger.http(`Redirecting to ${response.url} for ${request}`);
        }
    },
});

export default rofetch;
