const config = require('@/config').value;
const { proxyUri, proxyObj, proxyUrlHandler } = require('./unify-proxy');
const logger = require('./logger');
const http = require('http');
const https = require('https');

let agent = null;
if (proxyUri) {
    if (proxyUri.startsWith('http')) {
        const HttpsProxyAgent = require('https-proxy-agent');
        agent = new HttpsProxyAgent(proxyUri);
    } else if (proxyUri.startsWith('socks')) {
        const SocksProxyAgent = require('socks-proxy-agent').SocksProxyAgent;
        agent = new SocksProxyAgent(proxyUri);
    }
}

let proxyWrapper = () => false;
if (agent) {
    const proxyRegex = new RegExp(proxyObj.url_regex);
    const protocolMatch = (protocolLike) => protocolLike && protocolLike.toLowerCase().startsWith('http');

    proxyWrapper = (url, options, urlHandler) => {
        if (proxyRegex.test(url)) {
            if ((protocolMatch(options.protocol) || protocolMatch(url)) && (!urlHandler || urlHandler.host !== proxyUrlHandler.host)) {
                options.agent = agent;
                if (proxyObj.auth) {
                    options.headers['Proxy-Authorization'] = `Basic ${proxyObj.auth}`;
                }
                return true;
            }
        }
        return false;
    };
}

const requestWrapper = (url, options) => {
    let urlHandler;
    try {
        urlHandler = new URL(url);
    } catch (error) {
        // ignore
    }
    options.headers = options.headers || {};
    const headersLowerCaseKeys = Object.keys(options.headers).map((key) => key.toLowerCase());

    proxyWrapper(url, options, urlHandler) ? logger.info(`Proxy for ${url}`) : logger.debug(`Requesting ${url}`);

    // ua
    if (!headersLowerCaseKeys.includes('user-agent')) {
        options.headers['user-agent'] = config.ua;
    }

    if (urlHandler) {
        // referer
        if (!headersLowerCaseKeys.includes('referer')) {
            options.headers.referer = urlHandler.origin;
        }
        // host
        if (!headersLowerCaseKeys.includes('host')) {
            options.headers.host = urlHandler.host;
        }
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
                requestWrapper(req.url || req.href || `${req.protocol}//${req.hostname || req.host}${req.path}`, req);
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
