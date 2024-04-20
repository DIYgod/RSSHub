import logger from '@/utils/logger';
import { config } from '@/config';
import undici, { Request, RequestInfo, RequestInit } from 'undici';
import proxy from '@/utils/proxy';

const wrappedFetch: typeof undici.fetch = (input: RequestInfo, init?: RequestInit) => {
    const request = new Request(input, init);
    const options: RequestInit = {};

    logger.debug(`Outgoing request: ${request.method} ${request.url}`);

    // ua
    if (!request.headers.get('user-agent')) {
        request.headers.set('user-agent', config.ua);
    }

    // accept
    if (!request.headers.get('accept')) {
        request.headers.set('accept', '*/*');
    }

    // referer
    if (!request.headers.get('referer')) {
        try {
            const urlHandler = new URL(request.url);
            request.headers.set('referer', urlHandler.origin);
        } catch {
            // ignore
        }
    }

    // proxy
    if (!options.dispatcher && proxy.dispatcher) {
        const proxyRegex = new RegExp(proxy.proxyObj.url_regex);
        let urlHandler;
        try {
            urlHandler = new URL(request.url);
        } catch {
            // ignore
        }

        if (proxyRegex.test(request.url) && request.url.startsWith('http') && !(urlHandler && urlHandler.host === proxy.proxyUrlHandler?.host)) {
            options.dispatcher = proxy.dispatcher;
        }
    }

    return undici.fetch(request, options);
};

export default wrappedFetch;
