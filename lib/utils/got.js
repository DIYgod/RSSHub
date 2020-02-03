const logger = require('./logger');
const config = require('@/config').value;
const got = require('got');

const custom = got.extend({
    retry: {
        limit: config.requestRetry,
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
            },
        ],
    },
    headers: {
        'user-agent': config.ua,
    },
});
custom.all = (list) => Promise.all(list);

module.exports = custom;
