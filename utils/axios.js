const logger = require('./logger');
const config = require('../config');

const axiosRetry = require('axios-retry');
const axios = require('axios');
const tunnel = require('tunnel');

axiosRetry(axios, {
    retries: config.requestRetry,
    retryCondition: () => true,
    retryDelay: (count, err) => {
        logger.error(`Request ${err.config.url} fail, retry attempt #${count}: ${err}`);
        return 100;
    },
});

if (config.http_proxy.host && config.http_proxy.port) {
    const agent = tunnel.httpsOverHttp({proxy: config.http_proxy});
    axios.interceptors.request.use(function (config) {
        if (config.url.indexOf('https') !== -1) {
            config.httpsAgent = agent;
            config.proxy = false;
        }
        return config;
    });

}

axios.defaults.headers.common['User-Agent'] = config.ua;
axios.defaults.headers.common['X-APP'] = 'RSSHub';

module.exports = axios;
