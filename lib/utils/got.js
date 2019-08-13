const logger = require('./logger');
const config = require('@/config');
const got = require('got');
const queryString = require('query-string');

const custom = got.extend({
    retry: {
        retries: config.requestRetry,
        statusCodes: [408, 413, 429, 500, 502, 503, 504, 404], // add 404 to default for unit test
    },
    hooks: {
        beforeRetry: [
            (options, err, count) => {
                logger.error(`Request ${err.url} fail, retry attempt #${count}: ${err}`);
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
                if (options.data) {
                    options.body = options.body || options.data;
                }
                if (options.responseType === 'buffer') {
                    options.encoding = null;
                }
                if (options.params) {
                    options.query = options.query || queryString.stringify(options.params);
                }
                if (options.query) {
                    if (typeof options.query === 'string') {
                        options.query = options.query.replace(/([\u4e00-\u9fa5])/g, (str) => encodeURIComponent(str));
                    } else if (typeof options.query === 'object') {
                        for (const key in options.query) {
                            if (typeof options.query[key] === 'string') {
                                options.query[key] = options.query[key].replace(/([\u4e00-\u9fa5])/g, (str) => encodeURIComponent(str));
                            }
                        }
                    }
                    options.searchParams = options.query; // for Got v11 after
                }
            },
        ],
    },
    headers: {
        'user-agent': config.ua,
    },
});
custom.all = (list) => Promise.all(list);

module.exports = custom;
