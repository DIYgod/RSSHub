const logger = require('./logger');
const config = require('@/config').value;
const got = require('got');

const custom = got.extend({
    retry: {
        limit: config.requestRetry,
        statusCodes: [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 421, 422, 423, 424, 426, 428, 429, 431, 451, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511, 521, 522, 524],
    },
    hooks: {
        beforeRetry: [
            (options, err, count) => {
                logger.error(`Request ${options.url} fail, retry attempt #${count}: ${err}`);
                options.retryCount = count;
            },
        ],
        beforeRedirect: [
            (options, response) => {
                logger.http(`Redirecting to ${options.url} for ${response.requestUrl}`);
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

module.exports = custom;
