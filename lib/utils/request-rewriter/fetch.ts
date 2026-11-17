import type { SecureVersion } from 'node:tls';

import type { HeaderGeneratorOptions } from 'header-generator';
import { tryGetContext } from 'hono/context-storage';
import { RateLimiterMemory, RateLimiterQueue } from 'rate-limiter-flexible';
import type { Agent, Dispatcher, RequestInfo, RequestInit } from 'undici';
import undici, { Request } from 'undici';

import { config } from '@/config';
import { generatedHeaders as HEADER_LIST, generateHeaders } from '@/utils/header-generator';
import { waitForHostRateLimit } from '@/utils/host-rate-limit';
import logger from '@/utils/logger';
import proxy from '@/utils/proxy';
import limitResponseSize from '@/utils/request-rewriter/limit-response-size';
import { publicLookup, publicOnly as publicOnlyInterceptor } from '@/utils/request-rewriter/public-only';

const limiter = new RateLimiterMemory({
    points: 10,
    duration: 1,
    execEvenly: true,
});

const maxQueueSize = 4800;

const limiterQueue = new RateLimiterQueue(limiter, {
    maxQueueSize,
});

// The queue is first-in-first-out and shared by the whole process, so one incoming request may only
// hold a few places in it at a time. Otherwise a route following a long upstream list makes the
// outgoing requests of every other route wait until the last item of that list has been requested.
const maxPlacesPerRequest = limiter.points;
const places = new WeakMap<object, { held: number; waiting: Array<() => void> }>();

const removeToken = async () => {
    const ctx = tryGetContext();
    if (!ctx) {
        return limiterQueue.removeTokens(1);
    }
    let place = places.get(ctx);
    if (!place) {
        place = { held: 0, waiting: [] };
        places.set(ctx, place);
    }
    if (place.held < maxPlacesPerRequest) {
        place.held++;
    } else if (place.waiting.length < maxQueueSize) {
        const { waiting } = place;
        await new Promise<void>((resolve) => {
            waiting.push(resolve);
        });
    } else {
        throw new Error(`Number of requests reached it's maximum ${maxQueueSize}`);
    }
    try {
        return await limiterQueue.removeTokens(1);
    } finally {
        const next = place.waiting.shift();
        if (next) {
            next();
        } else {
            place.held--;
        }
    }
};

undici.setGlobalDispatcher(
    new undici.Agent({
        connect: { preferH2: true, autoSelectFamily: config.requestAutoSelectFamily },
    })
);

const http1Only: Dispatcher.DispatcherComposeInterceptor = (dispatch) => (opts, handler) => dispatch({ ...opts, allowH2: false } as Dispatcher.DispatchOptions, handler);

// undici only drops Authorization, Proxy-Authorization and Cookie when a redirect leaves the origin,
// credentials in custom headers have to be dropped here, once per hop
const dropCredentialHeaders =
    (origin: string, names: string[]): Dispatcher.DispatcherComposeInterceptor =>
    (dispatch) => {
        const credentialHeaders = new Set(names.map((name) => name.toLowerCase()));
        let crossOrigin = false;
        return (opts, handler) => {
            crossOrigin ||= new URL(opts.origin!).origin !== origin;
            if (!crossOrigin) {
                return dispatch(opts, handler);
            }
            const headers = Object.fromEntries(Object.entries(opts.headers as Record<string, string | string[]>).filter(([name]) => !credentialHeaders.has(name.toLowerCase())));
            return dispatch({ ...opts, headers }, handler);
        };
    };

const agents = new Map<string, Agent>();
const getAgent = (minVersion?: SecureVersion, publicOnly?: boolean) => {
    const key = `${minVersion}:${publicOnly}`;
    let agent = agents.get(key);
    if (!agent) {
        agent = new undici.Agent({ connect: { preferH2: true, minVersion, autoSelectFamily: config.requestAutoSelectFamily, lookup: publicOnly ? publicLookup : undefined } });
        agents.set(key, agent);
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

const wrappedFetch: typeof undici.fetch = async (
    input: RequestInfo,
    init?: RequestInit & { headerGeneratorOptions?: Partial<HeaderGeneratorOptions>; allowH2?: boolean; minVersion?: SecureVersion; credentialHeaders?: string[]; publicOnly?: boolean; maxResponseSize?: number }
) => {
    const request = new Request(input, init);
    const options: RequestInit = {};
    const publicOnly = !!init?.publicOnly && !config.feature.allow_user_supply_unsafe_domain;

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

    if ((init?.minVersion || publicOnly) && !options.dispatcher && !init?.dispatcher) {
        options.dispatcher = getAgent(init?.minVersion, publicOnly);
    }

    const interceptors = [init?.allowH2 === false && http1Only, publicOnly && publicOnlyInterceptor, !!init?.credentialHeaders?.length && dropCredentialHeaders(new URL(request.url).origin, init.credentialHeaders)].filter(
        (interceptor): interceptor is Dispatcher.DispatcherComposeInterceptor => !!interceptor
    );

    await removeToken();
    await waitForHostRateLimit(request.url, config.requestRateLimits, request.signal);

    if (interceptors.length > 0) {
        return limitResponseSize(
            await undici.fetch(request, {
                ...options,
                dispatcher: (options.dispatcher ?? init?.dispatcher ?? undici.getGlobalDispatcher()).compose(...interceptors),
            }),
            init?.maxResponseSize
        );
    }
    return limitResponseSize(await undici.fetch(request, options), init?.maxResponseSize);
};

export default wrappedFetch;
