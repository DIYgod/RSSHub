import { createFetch } from 'ofetch';
import { config } from '@/config';
import logger from '@/utils/logger';

const rofetch = createFetch().create({
    retryStatusCodes: [400, 408, 409, 425, 429, 500, 502, 503, 504],
    retry: config.requestRetry,
    retryDelay: 1000,
    // timeout: config.requestTimeout,
    onResponseError({ request, options }) {
        if (options.retry) {
            logger.warn(`Request ${request} remaining retry attempts: ${options.retry}`);
            if (!options.headers) {
                options.headers = {};
            }
            options.headers['x-retry'] = options.retry;
        }
    },
    onRequestError({ request, error }) {
        logger.error(`Request ${request} fail: ${error}`);
    },
    headers: {
        'user-agent': config.ua,
    },
});

export default rofetch;
