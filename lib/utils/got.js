const logger = require('./logger');
const config = require('@/config');
const SocksProxyAgent = require('socks-proxy-agent');
const tunnel = require('tunnel');
const got = require('got');
const queryString = require('query-string');

let agent = null;
if (config.proxy && config.proxy.protocol && config.proxy.host && config.proxy.port) {
    agent = {};
    const proxyUrl = `${config.proxy.protocol}://${config.proxy.host}:${config.proxy.port}`;

    switch (config.proxy.protocol) {
        case 'socks':
            agent.http = new SocksProxyAgent(proxyUrl);
            agent.https = new SocksProxyAgent(proxyUrl);
            break;
        case 'http':
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
            agent.http = tunnel.httpOverHttp({
                proxy: {
                    host: config.proxy.host,
                    port: parseInt(config.proxy.port),
                },
            });
            agent.https = tunnel.httpsOverHttp({
                proxy: {
                    host: config.proxy.host,
                    port: parseInt(config.proxy.port),
                },
            });
            break;
        case 'https':
            agent.http = tunnel.httpOverHttps({
                proxy: {
                    host: config.proxy.host,
                    port: parseInt(config.proxy.port),
                },
            });
            agent.https = tunnel.httpsOverHttps({
                proxy: {
                    host: config.proxy.host,
                    port: parseInt(config.proxy.port),
                },
            });
            break;
    }
}

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
                    options.searchParams = options.query; // for Got v11 after
                }

                if (agent && new RegExp(config.proxy.url_regex).test(options.href)) {
                    options.agent = agent[options.protocol.slice(0, -1)];

                    if (config.proxy.auth) {
                        options.headers['Proxy-Authorization'] = `Basic ${config.proxy.auth}`;
                    }
                    logger.info(`Proxy for ${options.href}`);
                }
            },
        ],
    },
    headers: {
        'user-agent': config.ua,
        'x-app': 'RSSHub',
    },
});
custom.all = (list) => Promise.all(list);

module.exports = custom;
