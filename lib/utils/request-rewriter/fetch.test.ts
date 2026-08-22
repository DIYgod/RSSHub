import { getCurrentCell, setCurrentCell } from 'node-network-devtools';
import undici, { ProxyAgent, Request } from 'undici';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import proxy from '@/utils/proxy';
import type { ProxyState } from '@/utils/proxy/multi-proxy';

import wrappedFetch, { useCustomHeader } from './fetch';

const getInitRequest = (): NonNullable<ReturnType<typeof getCurrentCell>>['request'] => ({
    requestHeaders: {},
    id: '',
    loadCallFrames: () => {},
    cookies: '',
    requestData: '',
    responseData: '',
    responseHeaders: {},
    responseInfo: {},
});

enum Env {
    dev = 'dev',
    production = 'production',
    test = 'test',
}

describe('useCustomHeader', () => {
    let originalEnv: string;

    beforeEach(() => {
        originalEnv = process.env.NODE_ENV || Env.test;
        process.env.ENABLE_REMOTE_DEBUGGING = 'true';
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    test('should register request with custom headers in dev environment', () => {
        process.env.NODE_ENV = Env.dev;

        const headers = new Headers();
        const headerText = 'authorization';
        const headerValue = 'Bearer token';
        headers.set(headerText, headerValue);

        const req = getInitRequest();
        setCurrentCell({
            request: req,
            pipes: [],
            isAborted: false,
        });

        useCustomHeader(headers);

        const cell = getCurrentCell();
        expect(cell).toBeDefined();

        let request = req;
        if (cell) {
            for (const { pipe } of cell.pipes) {
                request = pipe(request);
            }
        }

        expect(request.requestHeaders[headerText]).toEqual(headerValue);
    });

    test('should not register request in non-dev environment', () => {
        process.env.NODE_ENV = Env.production;

        const headers = new Headers();
        const headerText = 'content-type';
        const headerValue = 'application/json';

        headers.set(headerText, headerValue);
        const req = getInitRequest();

        setCurrentCell({
            request: req,
            pipes: [],
            isAborted: false,
        });
        useCustomHeader(headers);

        const cell = getCurrentCell();
        expect(cell).toBeDefined();

        let request = req;
        if (cell) {
            for (const { pipe } of cell.pipes) {
                request = pipe(request);
            }
        }

        expect(req.requestHeaders[headerText]).toBeUndefined();
    });
});

describe('wrappedFetch', () => {
    test('throws when fetch fails without proxy retry', async () => {
        const fetchSpy = vi.spyOn(undici, 'fetch').mockRejectedValueOnce(new Error('boom'));

        await expect(wrappedFetch('http://example.com')).rejects.toThrow('boom');

        fetchSpy.mockRestore();
    });
});

const buildProxyState = (): ProxyState[] => [
    {
        uri: 'http://proxy1.test',
        isActive: true,
        failureCount: 0,
        urlHandler: new URL('http://proxy1.test'),
    },
    {
        uri: 'http://proxy2.test',
        isActive: true,
        failureCount: 0,
        urlHandler: new URL('http://proxy2.test'),
    },
];

const applyProxyState = (proxies: ProxyState[]) => {
    proxy.proxyObj.strategy = 'on_retry';
    proxy.proxyObj.url_regex = 'example.com';
    proxy.proxyUrlHandler = null;
    proxy.multiProxy = {
        allProxies: proxies,
        proxyObj: { url_regex: 'example.com', strategy: 'on_retry' },
        getNextProxy: () => null,
        markProxyFailed: () => {},
        resetProxy: () => {},
    };
};

describe('request-rewriter fetch retry', () => {
    const originalStrategy = proxy.proxyObj.strategy;
    const originalUrlRegex = proxy.proxyObj.url_regex;
    const originalMultiProxy = proxy.multiProxy;
    const originalProxyUrlHandler = proxy.proxyUrlHandler;

    afterEach(() => {
        vi.restoreAllMocks();
        proxy.proxyObj.strategy = originalStrategy;
        proxy.proxyObj.url_regex = originalUrlRegex;
        proxy.multiProxy = originalMultiProxy;
        proxy.proxyUrlHandler = originalProxyUrlHandler;
    });

    test('retries with the next proxy when prefer-proxy header is set', async () => {
        const proxies = buildProxyState();
        applyProxyState(proxies);

        let index = 0;
        vi.spyOn(proxy, 'getCurrentProxy').mockImplementation(() => proxies[index]);
        const markProxyFailedSpy = vi.spyOn(proxy, 'markProxyFailed').mockImplementation(() => {
            index = 1;
        });
        const getDispatcherForProxySpy = vi.spyOn(proxy, 'getDispatcherForProxy').mockImplementation((proxyState) => new ProxyAgent({ uri: proxyState.uri }));

        const fetchSpy = vi.spyOn(undici, 'fetch');
        fetchSpy.mockRejectedValueOnce(new Error('boom'));
        fetchSpy.mockResolvedValueOnce(new undici.Response('ok'));

        const response = await wrappedFetch('http://example.com/resource', {
            headers: new Headers({
                'x-prefer-proxy': '1',
            }),
        });

        expect(response).toBeInstanceOf(undici.Response);
        expect(fetchSpy).toHaveBeenCalledTimes(2);
        expect(markProxyFailedSpy).toHaveBeenCalledWith('http://proxy1.test');
        expect(getDispatcherForProxySpy).toHaveBeenCalledWith(proxies[1]);

        const requestArg = fetchSpy.mock.calls[0][0];
        if (!(requestArg instanceof Request)) {
            throw new TypeError('wrappedFetch must pass a Request to undici.fetch');
        }
        expect(requestArg.headers.get('x-prefer-proxy')).toBeNull();
    });

    test('drops dispatcher when no next proxy is available', async () => {
        const proxies = buildProxyState();
        applyProxyState(proxies);

        vi.spyOn(proxy, 'getCurrentProxy').mockImplementation(() => proxies[0]);
        vi.spyOn(proxy, 'markProxyFailed').mockImplementation(() => {});
        vi.spyOn(proxy, 'getDispatcherForProxy').mockImplementation((proxyState) => new ProxyAgent({ uri: proxyState.uri }));

        const fetchSpy = vi.spyOn(undici, 'fetch');
        fetchSpy.mockRejectedValueOnce(new Error('boom'));
        fetchSpy.mockResolvedValueOnce(new undici.Response('ok'));

        await wrappedFetch('http://example.com/resource', {
            headers: {
                'x-prefer-proxy': '1',
            },
        });

        expect(fetchSpy).toHaveBeenCalledTimes(2);
        expect(fetchSpy.mock.calls[1][1]?.dispatcher).toBeUndefined();
    });
});
