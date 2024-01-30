import { config } from '@/config';
import logger from '@/utils/logger';
import http, { type RequestOptions } from 'node:http';
import https from 'node:https';
import proxy from '@/utils/proxy';

let proxyWrapper: (
    url: string,
    options: RequestOptions & {
        headers: Record<string, string>;
    }
) => boolean = () => false;

if (proxy.agent) {
    const proxyRegex = new RegExp(proxy.proxyObj.url_regex);
    const protocolMatch = (protocolLike?: string | null) => protocolLike?.toLowerCase().startsWith('http');

    proxyWrapper = (url, options) => {
        let urlHandler;
        try {
            urlHandler = new URL(url);
        } catch {
            // ignore
        }
        if (proxyRegex.test(url) && (protocolMatch(options.protocol) || protocolMatch(url)) && (!urlHandler || urlHandler.host !== proxy.proxyUrlHandler?.host)) {
            options.agent = proxy.agent || false;
            if (proxy.proxyObj.auth) {
                options.headers['Proxy-Authorization'] = `Basic ${proxy.proxyObj.auth}`;
            }
            return true;
        }
        return false;
    };
}

const requestWrapper = (url: string, options: http.RequestOptions = {}) => {
    options.headers = options.headers || {};

    const optionsWithHeaders = options as http.RequestOptions & {
        headers: Record<string, string>;
    };
    const headersLowerCaseKeys = new Set(Object.keys(optionsWithHeaders.headers).map((key) => key.toLowerCase()));

    let prxied = false;
    if (config.proxyStrategy === 'all') {
        prxied = proxyWrapper(url, optionsWithHeaders);
    } else if (config.proxyStrategy === 'on_retry' && (optionsWithHeaders as any).retryCount) {
        prxied = proxyWrapper(url, optionsWithHeaders);
    }
    if (prxied) {
        logger.debug(`Proxy for ${url}`);
    } else {
        logger.debug(`Requesting ${url}`);
    }

    // ua
    if (!headersLowerCaseKeys.has('user-agent')) {
        options.headers['user-agent'] = config.ua;
    }

    // Accept
    if (!headersLowerCaseKeys.has('Accept')) {
        options.headers.Accept = '*/*';
    }

    let urlHandler;
    try {
        urlHandler = new URL(url);
    } catch {
        // ignore
    }

    if (
        urlHandler && // referer
        !headersLowerCaseKeys.has('referer')
    ) {
        options.headers.referer = urlHandler.origin;
    }
};

const httpWrap = (func: typeof http.request) => {
    const origin = func;
    const warpped: typeof http.request = function (...args) {
        let url: string;
        let options: http.RequestOptions;
        if (args[0] instanceof URL || typeof args[0] === 'string') {
            url = args[0].toString();
            options = args[1] as http.RequestOptions;
        } else {
            options = args[0] as http.RequestOptions;
            url = `${options.protocol}//${options.hostname || options.host}${options.path}`;
        }
        requestWrapper(url, options);

        // @ts-expect-error apply
        return origin.apply(this, args);
    };
    return warpped;
};

http.get = httpWrap(http.get);
https.get = httpWrap(https.get);
http.request = httpWrap(http.request);
https.request = httpWrap(https.request);
