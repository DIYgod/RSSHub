import http from 'node:http';
import https from 'node:https';
import logger from '@/utils/logger';
import { config } from '@/config';
import proxy from '@/utils/proxy';
import { generateHeaders } from '@/utils/rand-user-agent';

type Get = typeof http.get | typeof https.get | typeof http.request | typeof https.request;

interface ExtendedRequestOptions extends http.RequestOptions {
    headerGeneratorPreset?: any;
}

const getWrappedGet: <T extends Get>(origin: T) => T = (origin) =>
    function (this: any, ...args: Parameters<typeof origin>) {
        let url: URL | null;
        let options: ExtendedRequestOptions = {};
        let callback: ((res: http.IncomingMessage) => void) | undefined;
        if (typeof args[0] === 'string' || args[0] instanceof URL) {
            url = new URL(args[0]);
            if (typeof args[1] === 'object') {
                options = args[1];
                callback = args[2];
            } else if (typeof args[1] === 'function') {
                options = {};
                callback = args[1];
            }
        } else {
            options = args[0];
            try {
                url = new URL(options.href || `${options.protocol || 'http:'}//${options.hostname || options.host}${options.path}${options.search || (options.query ? `?${options.query}` : '')}`);
            } catch {
                url = null;
            }
            if (typeof args[1] === 'function') {
                callback = args[1];
            }
        }
        if (!url) {
            return Reflect.apply(origin, this, args) as ReturnType<typeof origin>;
        }

        logger.debug(`Outgoing request: ${options.method || 'GET'} ${url}`);

        options.headers = options.headers || {};
        const headersLowerCaseKeys = new Set(Object.keys(options.headers).map((key) => key.toLowerCase()));

        // Generate headers using header-generator for realistic browser headers
        // Use the provided preset or default to chrome/mac os/desktop
        const generatedHeaders = generateHeaders(options.headerGeneratorPreset ? { preset: options.headerGeneratorPreset } : { browser: 'chrome', os: 'mac os', device: 'desktop' });

        // ua
        if (!headersLowerCaseKeys.has('user-agent')) {
            options.headers['user-agent'] = config.ua;
        }

        // Accept
        if (!headersLowerCaseKeys.has('accept')) {
            options.headers.accept = '*/*';
        }

        // sec-ch-ua headers (Chrome Client Hints)
        if (!headersLowerCaseKeys.has('sec-ch-ua') && generatedHeaders['sec-ch-ua']) {
            options.headers['sec-ch-ua'] = generatedHeaders['sec-ch-ua'];
        }
        if (!headersLowerCaseKeys.has('sec-ch-ua-mobile') && generatedHeaders['sec-ch-ua-mobile']) {
            options.headers['sec-ch-ua-mobile'] = generatedHeaders['sec-ch-ua-mobile'];
        }
        if (!headersLowerCaseKeys.has('sec-ch-ua-platform') && generatedHeaders['sec-ch-ua-platform']) {
            options.headers['sec-ch-ua-platform'] = generatedHeaders['sec-ch-ua-platform'];
        }

        // sec-fetch headers (Fetch Metadata)
        if (!headersLowerCaseKeys.has('sec-fetch-site') && generatedHeaders['sec-fetch-site']) {
            options.headers['sec-fetch-site'] = generatedHeaders['sec-fetch-site'];
        }
        if (!headersLowerCaseKeys.has('sec-fetch-mode') && generatedHeaders['sec-fetch-mode']) {
            options.headers['sec-fetch-mode'] = generatedHeaders['sec-fetch-mode'];
        }
        if (!headersLowerCaseKeys.has('sec-fetch-user') && generatedHeaders['sec-fetch-user']) {
            options.headers['sec-fetch-user'] = generatedHeaders['sec-fetch-user'];
        }
        if (!headersLowerCaseKeys.has('sec-fetch-dest') && generatedHeaders['sec-fetch-dest']) {
            options.headers['sec-fetch-dest'] = generatedHeaders['sec-fetch-dest'];
        }

        // referer
        if (!headersLowerCaseKeys.has('referer')) {
            options.headers.referer = url.origin;
        }

        // proxy
        if (!options.agent && proxy.agent) {
            const proxyRegex = new RegExp(proxy.proxyObj.url_regex);

            if (
                proxyRegex.test(url.toString()) &&
                url.protocol.startsWith('http') &&
                url.host !== proxy.proxyUrlHandler?.host &&
                url.host !== 'localhost' &&
                !url.host.startsWith('127.') &&
                !(config.puppeteerWSEndpoint?.includes(url.host) ?? false)
            ) {
                options.agent = proxy.agent;
            }
        }

        // Remove the headerGeneratorPreset before passing to the original function
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { headerGeneratorPreset, ...cleanOptions } = options;

        return Reflect.apply(origin, this, [url, cleanOptions, callback]) as ReturnType<typeof origin>;
    };

export default getWrappedGet;
