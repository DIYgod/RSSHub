import { config } from '@/config';
import logger from '@/utils/logger';
import http, { type RequestOptions } from 'node:http';
import https from 'node:https';

const proxyIsPAC = config.pacUri || config.pacScript;

import pacProxy from './pac-proxy';
import unifyProxy from './unify-proxy';

let proxyUri: string | undefined;
let proxyObj: Record<string, any> | undefined;
let proxyUrlHandler: URL | null = null;
if (proxyIsPAC) {
    const proxy = pacProxy(config.pacUri, config.pacScript, config.proxy)
    proxyUri = proxy.proxyUri;
    proxyObj = proxy.proxyObj;
    proxyUrlHandler = proxy.proxyUrlHandler;
} else {
    const proxy = unifyProxy(config.proxyUri, config.proxy)
    proxyUri = proxy.proxyUri;
    proxyObj = proxy.proxyObj;
    proxyUrlHandler = proxy.proxyUrlHandler;
}

let agent = null;
if (proxyIsPAC) {
    const { PacProxyAgent } = require('pac-proxy-agent');
    agent = new PacProxyAgent(`pac+${proxyUri}`);
} else if (proxyUri) {
    if (proxyUri.startsWith('http')) {
        const { HttpsProxyAgent } = require('https-proxy-agent');
        agent = new HttpsProxyAgent(proxyUri);
    } else if (proxyUri.startsWith('socks')) {
        const { SocksProxyAgent } = require('socks-proxy-agent');
        agent = new SocksProxyAgent(proxyUri);
    }
}

let proxyWrapper: (url: string, options: RequestOptions & {
    headers: Record<string, string>;
}) => boolean = () => false;

if (agent) {
    const proxyRegex = new RegExp(proxyObj.url_regex);
    const protocolMatch = (protocolLike?: string | null) => protocolLike?.toLowerCase().startsWith('http');

    proxyWrapper = (url, options) => {
        let urlHandler;
        try {
            urlHandler = new URL(url);
        } catch {
            // ignore
        }
        if (proxyRegex.test(url) && (protocolMatch(options.protocol) || protocolMatch(url)) && (!urlHandler || urlHandler.host !== proxyUrlHandler?.host)) {
            options.agent = agent;
            if (proxyObj.auth) {
                options.headers['Proxy-Authorization'] = `Basic ${proxyObj.auth}`;
            }
            return true;
        }
        return false;
    };
}

const requestWrapper = (
    url: string,
    options: http.RequestOptions = {},
) => {
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
            url = `${options.protocol}//${options.hostname || options.host}${options.path}`
        }
        requestWrapper(url, options);

        // @ts-ignore
        return origin.apply(this, args);
    };
    return warpped;
};

http.get = httpWrap(http.get);
https.get = httpWrap(https.get);
http.request = httpWrap(http.request);
https.request = httpWrap(https.request);
