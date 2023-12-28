const config = require('@/config').value;
const { proxyUri, proxyObj, proxyUrlHandler } = require('./unify-proxy');
const logger = require('./logger');
const http = require('http');
const https = require('https');

let agent = null;
if (proxyUri) {
    if (proxyUri.startsWith('http')) {
        const { HttpsProxyAgent } = require('https-proxy-agent');
        agent = new HttpsProxyAgent(proxyUri);
    } else if (proxyUri.startsWith('socks')) {
        const { SocksProxyAgent } = require('socks-proxy-agent');
        agent = new SocksProxyAgent(proxyUri);
    }
}

let proxyWrapper = () => false;
if (agent) {
    const proxyRegex = new RegExp(proxyObj.url_regex);
    const protocolMatch = (protocolLike) => protocolLike && protocolLike.toLowerCase().startsWith('http');

    proxyWrapper = (url, options) => {
        let urlHandler;
        try {
            urlHandler = new URL(url);
        } catch (error) {
            // ignore
        }
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
} else if (config.reverseProxyUrl) {
    proxyWrapper = (url, options) => {
        const urlIn = options.url?.toString() || url;
        const proxyRegex = new RegExp(proxyObj.url_regex);
        if (
            proxyRegex.test(urlIn) &&
            !urlIn.startsWith(config.reverseProxyUrl) &&
            !options.cookieJar &&
            !options.headers['user-agent']?.startsWith('PixivIOSApp') &&
            !options.headers['x-goog-api-client'] &&
            options.headers.accept !== 'application/dns-json'
        ) {
            options.url = new URL(`${config.reverseProxyUrl}${encodeURIComponent(urlIn)}`);

            return true;
        }
        return false;
    };
}

const requestWrapper = (
    url,
    options = {
        headers: {},
    }
) => {
    options.headers = options.headers || {};
    const headersLowerCaseKeys = Object.keys(options.headers).map((key) => key.toLowerCase());

    let prxied = false;
    if (config.proxyStrategy === 'all') {
        prxied = proxyWrapper(url, options);
    } else if (config.proxyStrategy === 'on_retry') {
        if (options.retryCount) {
            prxied = proxyWrapper(url, options);
        }
    }
    if (prxied) {
        logger.http(`Proxy for ${url}`);
    } else {
        logger.http(`Requesting ${url}`);
    }

    // ua
    if (!headersLowerCaseKeys.includes('user-agent')) {
        options.headers['user-agent'] = config.ua;
    }

    // Accept
    if (!headersLowerCaseKeys.includes('Accept')) {
        options.headers.Accept = '*/*';
    }

    let urlHandler;
    try {
        urlHandler = new URL(options.url || url);
    } catch (error) {
        // ignore
    }

    if (urlHandler) {
        // referer
        if (!headersLowerCaseKeys.includes('referer')) {
            options.headers.referer = urlHandler.origin;
        }
    }
};

const httpWrap = (func) => {
    const origin = func;
    return function (url, request) {
        const args = Array.prototype.slice.call(arguments);
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
        args[0] = request?.url || url;
        return origin.apply(this, args);
    };
};

http.get = httpWrap(http.get);
https.get = httpWrap(https.get);
http.request = httpWrap(http.request);
https.request = httpWrap(https.request);
