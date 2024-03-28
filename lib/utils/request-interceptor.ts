import { setupServer } from 'msw/node';
import { http } from 'msw';
import logger from '@/utils/logger';
import { config } from '@/config';
import { fetch, Headers, FormData, Request, Response } from 'undici';
import proxy from '@/utils/proxy';

Object.defineProperties(globalThis, {
    fetch: { value: fetch, writable: true },
    Headers: { value: Headers },
    FormData: { value: FormData },
    Request: { value: Request },
    Response: { value: Response },
});

const handler = (request: globalThis.Request, options: NonNullable<Parameters<typeof fetch>[1]>) => {
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
            // fetch
            options.dispatcher = proxy.dispatcher;
        }
    }
};

const server = setupServer(
    // @ts-expect-error
    http.all('*', ({ request }) => {
        logger.debug(`Outgoing request: ${request.method} ${request.url}`);
        const requestClone = request.clone();
        const options = {};
        handler(requestClone, options);
        // @ts-expect-error
        return fetch(requestClone, options);
    })
);
server.listen();
