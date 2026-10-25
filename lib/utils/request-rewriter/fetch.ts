import type { SecureVersion } from 'node:tls';

import type { HeaderGeneratorOptions } from 'header-generator';
import { RateLimiterMemory, RateLimiterQueue } from 'rate-limiter-flexible';
import type { Agent, Dispatcher, RequestInfo, RequestInit } from 'undici';
import undici, { Request } from 'undici';

import { config } from '@/config';
import { generatedHeaders as HEADER_LIST, generateHeaders } from '@/utils/header-generator';
import { waitForHostRateLimit } from '@/utils/host-rate-limit';
import logger from '@/utils/logger';
import proxy from '@/utils/proxy';

const limiter = new RateLimiterMemory({
    points: 10,
    duration: 1,
    execEvenly: true,
});

const limiterQueue = new RateLimiterQueue(limiter, {
    maxQueueSize: 4800,
});

undici.setGlobalDispatcher(
    new undici.Agent({
        connect: { preferH2: true, autoSelectFamily: config.requestAutoSelectFamily },
    })
);

const http1Only: Dispatcher.DispatcherComposeInterceptor = (dispatch) => (opts, handler) => dispatch({ ...opts, allowH2: false } as Dispatcher.DispatchOptions, handler);

const tlsAgents = new Map<SecureVersion, Agent>();
const getTlsAgent = (minVersion: SecureVersion) => {
    let agent = tlsAgents.get(minVersion);
    if (!agent) {
        agent = new undici.Agent({ connect: { preferH2: true, minVersion, autoSelectFamily: config.requestAutoSelectFamily } });
        tlsAgents.set(minVersion, agent);
    }
    return agent;
};

export const useCustomHeader = async (headers: Iterable<[string, string]>) => {
    if (process.env.NODE_ENV !== 'dev') {
        return;
    }
    const { useRegisterRequest } = await import('node-network-devtools');
    useRegisterRequest((req) => {
        for (const [key, value] of headers) {
            req.requestHeaders[key] = value;
        }
        return req;
    });
};

const wrappedFetch: typeof undici.fetch = async (input: RequestInfo, init?: RequestInit & { headerGeneratorOptions?: Partial<HeaderGeneratorOptions>; allowH2?: boolean; minVersion?: SecureVersion }) => {
    const request = new Request(input, init);
    const options: RequestInit = {};

    logger.debug(`Outgoing request: ${request.method} ${request.url}`);

    // ua
    if (config.isDefaultUA || init?.headerGeneratorOptions) {
        const generatedHeaders = generateHeaders(init?.headerGeneratorOptions);

        if (!request.headers.get('user-agent')) {
            request.headers.set('user-agent', generatedHeaders['user-agent']);
        }

        for (const header of HEADER_LIST) {
            const headerValue = generatedHeaders[header];
            if (!request.headers.has(header) && headerValue) {
                request.headers.set(header, headerValue);
            }
        }
    } else if (!request.headers.get('user-agent')) {
        request.headers.set('user-agent', config.ua);
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

    let isRetry = false;
    if (request.headers.get('x-prefer-proxy')) {
        isRetry = true;
        request.headers.delete('x-prefer-proxy');
    }

    if (config.enableRemoteDebugging) {
        await useCustomHeader(request.headers);
    }

    // proxy
    if (!init?.dispatcher && (proxy.proxyObj.strategy !== 'on_retry' || isRetry)) {
        const proxyRegex = new RegExp(proxy.proxyObj.url_regex);
        let urlHandler;
        try {
            urlHandler = new URL(request.url);
        } catch {
            // ignore
        }

        if (proxyRegex.test(request.url) && request.url.startsWith('http') && !(urlHandler && urlHandler.host === proxy.proxyUrlHandler?.host)) {
            const dispatcher = await proxy.getDispatcher(request.url, init?.minVersion);
            if (dispatcher) {
                options.dispatcher = dispatcher;
                logger.debug(`Proxying request: ${request.url}`);
            }
        }
    }

    if (init?.minVersion && !options.dispatcher && !init.dispatcher) {
        options.dispatcher = getTlsAgent(init.minVersion);
    }

    await limiterQueue.removeTokens(1);
    await waitForHostRateLimit(request.url, config.requestRateLimits, request.signal);

    if (init?.allowH2 === false) {
        return undici.fetch(request, {
            ...options,
            dispatcher: (options.dispatcher ?? init.dispatcher ?? undici.getGlobalDispatcher()).compose(http1Only),
        });
    }
    return undici.fetch(request, options);
};

export default wrappedFetch;
