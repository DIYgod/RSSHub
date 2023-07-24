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
        if (proxyRegex.test(urlIn) && !urlIn.startsWith(config.reverseProxyUrl) && !options.cookieJar && !options.headers['user-agent'].startsWith('PixivIOSApp')) {
            options.url = new URL(`${config.reverseProxyUrl}${encodeURIComponent(urlIn)}`);

            // remove cloudflare headers
            for (const prop in options.headers) {
                if (prop.startsWith('cf-') || prop === 'x-real-ip' || prop === 'x-forwarded-for' || prop === 'x-forwarded-proto') {
                    delete options.headers[prop];
                }
            }

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

    proxyWrapper(url, options) ? logger.info(`Proxy for ${url}`) : logger.debug(`Requesting ${url}`);

    // ua
    if (!headersLowerCaseKeys.includes('user-agent')) {
        options.headers['user-agent'] = config.ua;
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
        // host
        if (!headersLowerCaseKeys.includes('host')) {
            options.headers.host = urlHandler.host;
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
