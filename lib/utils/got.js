import logger from './logger';
import { value as config } from '../lib/config.js';
import got from 'got';

const custom = got.extend({
    retry: config.requestRetry,
    hooks: {
        beforeRetry: [
            (options, err, count) => {
                logger.error(`Request ${options.url} fail, retry attempt #${count}: ${err}`);
            },
        ],
        afterResponse: [
            (response) => {
                try {
                    response.data = JSON.parse(response.body);
                } catch (e) {
                    response.data = response.body;
                }
                response.status = response.statusCode;
                return response;
            },
        ],
        init: [
            (options) => {
                // compatible with axios api
                if (options && options.data) {
                    options.body = options.body || options.data;
                }
            },
        ],
    },
    headers: {
        'user-agent': config.ua,
    },
    timeout: config.requestTimeout,
});
custom.all = (list) => Promise.all(list);

export default custom;
