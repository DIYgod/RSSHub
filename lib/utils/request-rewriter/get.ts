// oxlint-disable unicorn-js/no-this-outside-of-class
import type http from 'node:http';
import type https from 'node:https';
import type { ParsedUrlQuery } from 'node:querystring';

import type { HeaderGeneratorOptions } from 'header-generator';

import { config } from '@/config';
import { generatedHeaders as HEADER_LIST, generateHeaders } from '@/utils/header-generator';
import logger from '@/utils/logger';
import proxy from '@/utils/proxy';

type Get = typeof http.get | typeof https.get | typeof http.request | typeof https.request;

interface ExtendedRequestOptions extends http.RequestOptions {
    headerGeneratorOptions?: Partial<HeaderGeneratorOptions>;
    // legacy `url.parse()` shaped options, still accepted by node:http
    href?: string;
    search?: string;
    query?: string | ParsedUrlQuery;
    headers?: http.OutgoingHttpHeaders;
}

const getWrappedGet = <T extends Get>(origin: T): T => {
    const wrapped = function (this: any, ...args: Parameters<T>) {
        let url: URL | null;
        let options: ExtendedRequestOptions = {};
        let callback: ((res: http.IncomingMessage) => void) | undefined;
        if (typeof args[0] === 'string' || args[0] instanceof URL) {
            url = new URL(args[0]);
            if (typeof args[1] === 'object') {
                options = args[1] as ExtendedRequestOptions;
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
            return origin.apply(this, args);
        }

        logger.debug(`Outgoing request: ${options.method || 'GET'} ${url}`);

        options.headers ||= {};
        const headersLowerCaseKeys = new Set(Object.keys(options.headers).map((key) => key.toLowerCase()));

        // ua
        if (config.isDefaultUA || options.headerGeneratorOptions) {
            const generatedHeaders = generateHeaders(options.headerGeneratorOptions);

            if (!headersLowerCaseKeys.has('user-agent')) {
                options.headers['user-agent'] = generatedHeaders['user-agent'];
            }

            for (const header of HEADER_LIST) {
                const generatedHeader = generatedHeaders[header];
                if (!headersLowerCaseKeys.has(header) && generatedHeader) {
                    options.headers[header] = generatedHeader;
                }
            }
        } else if (!headersLowerCaseKeys.has('user-agent')) {
            options.headers['user-agent'] = config.ua;
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
                [config.playwrightWSEndpoint, config.playwrightCDPEndpoint].every((endpoint) => !endpoint?.includes(url.host))
            ) {
                options.agent = proxy.agent;
            }
        }

        // Remove the headerGeneratorOptions before passing to the original function
        // oxlint-disable-next-line no-unused-vars
        const { headerGeneratorOptions, ...cleanOptions } = options;

        return origin.call(this, url, cleanOptions, callback);
    };

    return wrapped as T;
};

export default getWrappedGet;
