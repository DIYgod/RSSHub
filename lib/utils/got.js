const logger = require('./logger');
const config = require('@/config').value;
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
                    options.searchParams = options.query; // for Got v11 after
                }
                if (options.baseUrl) {
                    options.prefixUrl = options.baseUrl; // for Got next version
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
