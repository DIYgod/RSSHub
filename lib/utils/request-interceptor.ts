import { setupServer } from 'msw/node';
import { http, passthrough } from 'msw';
import logger from '@/utils/logger';
import { config } from '@/config';
import { fetch, Headers, FormData, ProxyAgent, Request, RequestInfo, RequestInit, Response } from 'undici';
import proxy from '@/utils/proxy';
import type nodehttp from 'node:http';

class ExtendedRequest extends Request {
    public dispatcher: ProxyAgent | undefined;
    public agent: nodehttp.ClientRequestArgs['agent'];

    constructor(input: RequestInfo, init?: RequestInit & nodehttp.ClientRequestArgs) {
        super(input, init);
        this.dispatcher = init?.dispatcher; // fetch
        this.agent = init?.agent; // http
    }
}

Object.defineProperties(globalThis, {
    fetch: { value: fetch, writable: true },
    Headers: { value: Headers },
    FormData: { value: FormData },
    Request: { value: ExtendedRequest },
    Response: { value: Response },
});

const handler = (request: ExtendedRequest) => {
    request.headers.set('debug', '1');
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
    if (!request.dispatcher && !request.agent && proxy.dispatcher) {
        const proxyRegex = new RegExp(proxy.proxyObj.url_regex);
        let urlHandler;
        try {
            urlHandler = new URL(request.url);
        } catch {
            // ignore
        }

        if (proxyRegex.test(request.url) && request.url.startsWith('http') && !(urlHandler && urlHandler.host === proxy.proxyUrlHandler?.host)) {
            // fetch
            request.dispatcher = proxy.dispatcher;

            // http
            request.agent = proxy.agent || undefined;
            if (proxy.proxyObj.auth) {
                request.headers.set('Proxy-Authorization', `Basic ${proxy.proxyObj.auth}`);
            }
        }
    }
};

const server = setupServer(
    http.all('*', ({ request }) => {
        logger.debug(`Outgoing request: ${request.method} ${request.url}`);
        handler(request);
        return passthrough();
    })
);
server.listen();
