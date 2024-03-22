import { ofetch } from 'ofetch';
import { config } from '@/config';
import logger from '@/utils/logger';

const rofetch = ofetch.create({
    retry: config.requestRetry,
    retryDelay: 1000,
    timeout: config.requestTimeout,
    headers: {
        'user-agent': config.ua,
    },
    onRequestError({ request, error }) {
        logger.error(`Request ${request.url} fail: ${error}`);
    },
});

export default rofetch;
