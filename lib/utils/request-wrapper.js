const config = require('@/config').value;
const logger = require('./logger');
const http = require('http');
const https = require('https');

let tunnel;
let HttpsProxyAgent;
let SocksProxyAgent;

let agent = null;
if (config.proxyUri && typeof config.proxyUri === 'string') {
    let proxy = null;
    if (config.proxyUri.startsWith('http')) {
        HttpsProxyAgent = HttpsProxyAgent || require('https-proxy-agent');
        proxy = new HttpsProxyAgent(config.proxyUri);
    } else if (config.proxyUri.startsWith('socks')) {
        SocksProxyAgent = SocksProxyAgent || require('socks-proxy-agent');
        proxy = new SocksProxyAgent(config.proxyUri);
    } else {
        throw 'Unknown proxy-uri format';
    }

    agent = {
        http: proxy,
        https: proxy,
    };
} else if (config.proxy && config.proxy.protocol && config.proxy.host && config.proxy.port) {
    agent = {};
    const proxyUrl = `${config.proxy.protocol}://${config.proxy.host}:${config.proxy.port}`;

    switch (config.proxy.protocol) {
        case 'socks':
            SocksProxyAgent = SocksProxyAgent || require('socks-proxy-agent');
            agent.http = new SocksProxyAgent(proxyUrl);
            agent.https = new SocksProxyAgent(proxyUrl);
            break;
        case 'http':
            tunnel = tunnel || require('tunnel');
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
            tunnel = tunnel || require('tunnel');
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
        const urlHandler = new URL(url);
        // referer
        if (!options.headers.referer && !options.headers.Referer) {
            options.headers.referer = urlHandler.origin;
        }
        // host
        if (!options.headers.host && !options.headers.Host) {
            options.headers.host = urlHandler.host;
        }
    } catch (e) {
        // do nothing
    }
};

const httpWrap = (func) => {
    const origin = func;
    return function (url, request) {
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
