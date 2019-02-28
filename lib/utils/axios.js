const logger = require('./logger');
const config = require('../config');
const HttpAgent = require('http-proxy-agent');
const HttpsAgent = require('https-proxy-agent');
const SocksAgent = require('socks-proxy-agent');

const got = require('got');
let proxyUrl, agent;
if (config.proxy && config.proxy.protocol && typeof config.proxy.protocol === 'string' && config.proxy.host && config.proxy.port) {
    proxyUrl = `${config.proxy.protocol}://${config.proxy.host}:${config.proxy.port}`;
    switch (config.proxy.protocol.slice(0, 5)) {
        case 'socks':
            agent = {
                http: new SocksAgent(proxyUrl),
                https: new SocksAgent(proxyUrl),
            };
            break;
        case 'http':
        case 'https':
            agent = {
                http: new HttpAgent(proxyUrl),
                https: new HttpsAgent(proxyUrl),
            };
    }
}

const custom = got.extend({
    retry: config.requestRetry,
    hooks: {
        beforeRetry: [
            (options, err, count) => {
                logger.error(`Request ${options.requestUrl} fail, retry attempt #${count}: ${err}`);
            },
        ],
        afterResponse: [
            (response) => {
                if (response.headers['content-type'].indexOf('application/json') !== -1) {
                    try {
                        response.data = JSON.parse(response.body);
                    } catch (e) {
                        response.data = response.body;
                    }
                } else {
                    response.data = response.body;
                }
                return response;
            },
        ],
    },
    agent: agent,
    headers: {
        'user-agent': config.ua,
        'x-app': 'RSSHub',
    },
});

module.exports = custom;
