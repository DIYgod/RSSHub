import logger from '@/utils/logger';
import { config } from '@/config';
import undici, { Request, RequestInfo, RequestInit } from 'undici';
import proxy from '@/utils/proxy';
import { RateLimiterMemory, RateLimiterQueue } from 'rate-limiter-flexible';
import { useRegisterRequest } from 'node-network-devtools';
import { generateHeaders, generatedHeaders as HEADER_LIST } from '@/utils/header-generator';
import type { HeaderGeneratorOptions } from 'header-generator';

const limiter = new RateLimiterMemory({
    points: 10,
    duration: 1,
    execEvenly: true,
});

const limiterQueue = new RateLimiterQueue(limiter, {
    maxQueueSize: 4800,
});

export const useCustomHeader = (headers: Headers) => {
    process.env.NODE_ENV === 'dev' &&
        useRegisterRequest((req) => {
            for (const [key, value] of headers.entries()) {
                req.requestHeaders[key] = value;
            }
            return req;
        });
};

const wrappedFetch: typeof undici.fetch = async (input: RequestInfo, init?: RequestInit & { headerGeneratorOptions?: Partial<HeaderGeneratorOptions> }) => {
    const request = new Request(input, init);
    const options: RequestInit = {};

    logger.debug(`Outgoing request: ${request.method} ${request.url}`);

    const generatedHeaders = generateHeaders(init?.headerGeneratorOptions);

    // ua
    if (!request.headers.has('user-agent')) {
        request.headers.set('user-agent', config.ua);
    }

    for (const header of HEADER_LIST) {
        if (!request.headers.has(header) && generatedHeaders[header]) {
            request.headers.set(header, generatedHeaders[header]);
        }
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

    config.enableRemoteDebugging && useCustomHeader(request.headers);

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
            const currentProxy = proxy.getCurrentProxy();
            if (currentProxy) {
                const dispatcher = proxy.getDispatcherForProxy(currentProxy);
                if (dispatcher) {
                    options.dispatcher = dispatcher;
                    logger.debug(`Proxying request via ${currentProxy.uri}: ${request.url}`);
                }
            }
        }
    }

    await limiterQueue.removeTokens(1);

    const maxRetries = proxy.multiProxy?.allProxies.length || 1;

    const attemptRequest = async (attempt: number): Promise<Response> => {
        try {
            return await undici.fetch(request, options);
        } catch (error) {
            if (options.dispatcher && proxy.multiProxy && attempt < maxRetries - 1) {
                const currentProxy = proxy.getCurrentProxy();
                if (currentProxy) {
                    logger.warn(`Request failed with proxy ${currentProxy.uri}, trying next proxy: ${error}`);
                    proxy.markProxyFailed(currentProxy.uri);

                    const nextProxy = proxy.getCurrentProxy();
                    if (nextProxy && nextProxy.uri !== currentProxy.uri) {
                        const nextDispatcher = proxy.getDispatcherForProxy(nextProxy);
                        if (nextDispatcher) {
                            options.dispatcher = nextDispatcher;
                        }
                        logger.debug(`Retrying request with proxy ${nextProxy.uri}: ${request.url}`);
                        return attemptRequest(attempt + 1);
                    } else {
                        logger.warn('No more proxies available, trying without proxy');
                        delete options.dispatcher;
                        return attemptRequest(attempt + 1);
                    }
                }
            }
            throw error;
        }
    };

    return attemptRequest(0);
};

export default wrappedFetch;
