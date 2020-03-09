const config = require('@/config').value;
const SocksProxyAgent = require('socks-proxy-agent');
const tunnel = require('tunnel');
const logger = require('./logger');
const http = require('http');
const https = require('https');

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

const requestWrapper = (url, options) => {
    // agent
    if (agent && new RegExp(config.proxy.url_regex).test(url)) {
        let agentResult;
        try {
            agentResult = agent[(options.protocol || url.match(/(https?:)/)[1]).slice(0, -1)];
        } catch (error) {
            agentResult = null;
        }
        options.agent = agentResult;

        if (config.proxy.auth) {
            if (!options.headers) {
                options.headers = {};
            }
            options.headers['Proxy-Authorization'] = `Basic ${config.proxy.auth}`;
        }
        logger.info(`Proxy for ${url}`);
    }

    // ua
    let hasUA = false;
    for (const header in options.headers) {
        if (header.toLowerCase() === 'user-agent') {
            hasUA = true;
        }
    }
    if (!hasUA) {
        if (!options.headers) {
            options.headers = {};
        }
        options.headers['user-agent'] = config.ua;
    }

    // server
    options.headers.server = 'RSSHub';

    try {
        // referer
        if (!options.headers.referer && !options.headers.Referer) {
            const urlHandler = new URL(url);
            options.headers.referer = urlHandler.origin;
        }
        // host
        if (!options.headers.host && !options.headers.Host) {
            const urlHandler = new URL(url);
            options.headers.host = urlHandler.host;
        }
    } catch (e) {
        // do nothing
    }
};

const httpWrap = (func) => {
    const origin = func;
    return function(url, request) {
        if (typeof url === 'object') {
            if (url instanceof URL) {
                requestWrapper(url.toString(), request);
            } else {
                const req = url;
                requestWrapper(req.url || req.href || `${req.protocol}//${req.hostname}${req.path}`, req);
            }
        } else {
            requestWrapper(url, request);
        }
        return origin.apply(this, arguments);
    };
};

http.get = httpWrap(http.get);
https.get = httpWrap(https.get);
http.request = httpWrap(http.request);
https.request = httpWrap(https.request);
