const logger = require('./logger');
const config = require('../config');
const SocksProxyAgent = require('socks-proxy-agent');
const axiosRetry = require('axios-retry');

let axios = require('axios');
if (config.proxy && config.proxy.protocol && typeof config.proxy.protocol === 'string' && config.proxy.protocol.slice(0, 5) === 'socks' && config.proxy.host && config.proxy.port) {
    // axios closure lead to recursive invokation on create
    const proxyUrl = `${config.proxy.protocol}://${config.proxy.host}:${config.proxy.port}`;
    const axiosCpy = axios;
    // When used directly
    const dump = axios.create({
        httpAgent: new SocksProxyAgent(proxyUrl),
        httpsAgent: new SocksProxyAgent(proxyUrl),
    });
    dump.create = function(option, ...args) {
        option = option || {};
        option = {
            httpAgent: new SocksProxyAgent(proxyUrl),
            httpsAgent: new SocksProxyAgent(proxyUrl),
            ...option,
        };
        return axiosCpy.create(option, ...args);
    };
    axios = dump;
}
axiosRetry(axios, {
    retries: config.requestRetry,
    retryCondition: () => true,
    retryDelay: (count, err) => {
        logger.error(`Request ${err.config.url} fail, retry attempt #${count}: ${err}`);
        return 100;
    },
});

axios.defaults.headers.common['User-Agent'] = config.ua;
axios.defaults.headers.common['X-APP'] = 'RSSHub';

module.exports = axios;
