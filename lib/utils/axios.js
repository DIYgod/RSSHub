const logger = require('./logger');
const config = require('@/config');
const SocksProxyAgent = require('socks-proxy-agent');
const axiosRetry = require('axios-retry');
const axios = require('axios');
const tunnel = require('tunnel');

if (config.proxy && config.proxy.protocol && config.proxy.host && config.proxy.port) {
    const proxyUrl = `${config.proxy.protocol}://${config.proxy.host}:${config.proxy.port}`;
    axios.interceptors.request.use((options) => {
        if (new RegExp(config.proxy.url_regex).test(options.url)) {
            switch (config.proxy.protocol) {
                case 'socks':
                    options.httpAgent = new SocksProxyAgent(proxyUrl);
                    options.httpsAgent = new SocksProxyAgent(proxyUrl);
                    break;
                case 'http':
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
                    options.httpAgent = tunnel.httpOverHttp({
                        proxy: {
                            host: config.proxy.host,
                            port: parseInt(config.proxy.port),
                        },
                    });
                    options.httpsAgent = tunnel.httpsOverHttp({
                        proxy: {
                            host: config.proxy.host,
                            port: parseInt(config.proxy.port),
                        },
                    });
                    break;
                case 'https':
                    options.httpAgent = tunnel.httpOverHttps({
                        proxy: {
                            host: config.proxy.host,
                            port: parseInt(config.proxy.port),
                            proxyAuth: `${config.proxy.auth.username}:${config.proxy.auth.password}`,
                        },
                    });
                    options.httpsAgent = tunnel.httpsOverHttps({
                        proxy: {
                            host: config.proxy.host,
                            port: parseInt(config.proxy.port),
                            proxyAuth: `${config.proxy.auth.username}:${config.proxy.auth.password}`,
                        },
                    });
                    break;
            }
            if (config.proxy.auth) {
                options.headers['Proxy-Authorization'] = `Basic ${config.proxy.auth}`;
            }
            logger.info(`Proxy for ${options.url}`);
        }
        return options;
    });
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
