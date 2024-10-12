import { createFetch } from 'ofetch';
import { config } from '@/config';
import logger from '@/utils/logger';
import ip from 'ipaddr.js';
import { lookup as nativeCallbackLookup } from 'dns';
import { promisify } from 'util';

const lookup = promisify(nativeCallbackLookup);

const rofetch = createFetch().create({
    retryStatusCodes: [400, 408, 409, 425, 429, 500, 502, 503, 504],
    retry: config.requestRetry,
    retryDelay: 1000,
    timeout: config.requestTimeout,
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
    onRequest: async ({ request }) => {
        const url = typeof request === 'string' ? new URL(request) : new URL(request.url);
        let addr;
        // for test
        if (url.hostname.endsWith('.test') || url.hostname.endsWith('.mock') || url.hostname.endsWith('.proxy')) {
            return;
        }
        if (ip.isValid(url.hostname)) {
            addr = url.hostname;
        } else {
            const { address } = await lookup(url.hostname);
            addr = address;
        }
        const parsedIp = ip.process(addr);
        if (parsedIp.range() === 'unicast') {
            return;
        }
        if (config.feature.allow_cidr) {
            const allowCIDR = ip.parseCIDR(config.feature.allow_cidr);
            // eslint-disable-next-line unicorn/prefer-regexp-test
            if (parsedIp.match(allowCIDR)) {
                return;
            }
        }
        throw new Error('The IP of the domain is reserved!');
    },
});

export default rofetch;
