import { createFetch } from 'ofetch';
import { config } from '@/config';
import logger from '@/utils/logger';

const rofetch = createFetch().create({
    retry: config.requestRetry,
    retryDelay: 1000,
    // timeout: config.requestTimeout,
    onRequestError({ request, error }) {
        logger.error(`Request ${request} fail: ${error}`);
    },
    headers: {
        'user-agent': config.ua,
    },
});

export default rofetch;
