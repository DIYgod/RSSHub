import { getCurrentCell, setCurrentCell } from 'node-network-devtools';
import undici from 'undici';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useCustomHeader } from './fetch';

const getInitRequest = () =>
    ({
        requestHeaders: {} as Record<string, string>,
        id: '',
        loadCallFrames: () => {},
        cookies: '',
        requestData: '',
        responseData: '',
        responseHeaders: {},
        responseInfo: {},
    }) satisfies NonNullable<ReturnType<typeof getCurrentCell>>['request'];

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
        const { default: wrappedFetch } = await import('./fetch');

        await expect(wrappedFetch('http://example.com')).rejects.toThrow('boom');

        fetchSpy.mockRestore();
    });
});

describe('request-rewriter fetch retry', () => {
    const buildProxyState = () => [
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

    const loadWrappedFetch = async (proxyMock: any) => {
        vi.resetModules();
        vi.doMock('@/utils/logger', () => ({
            default: {
                debug: vi.fn(),
                warn: vi.fn(),
                info: vi.fn(),
                error: vi.fn(),
                http: vi.fn(),
            },
        }));
        vi.doMock('@/utils/proxy', () => ({
            default: proxyMock,
        }));

        return (await import('@/utils/request-rewriter/fetch')).default;
    };

    afterEach(() => {
        vi.restoreAllMocks();
        vi.resetModules();
        vi.unmock('@/utils/logger');
        vi.unmock('@/utils/proxy');
    });

    test('retries with the next proxy when prefer-proxy header is set', async () => {
        const proxies = buildProxyState();
        let index = 0;
        const proxyMock = {
            proxyObj: {
                strategy: 'on_retry',
                url_regex: 'example.com',
            },
            proxyUrlHandler: null,
            multiProxy: {
                allProxies: proxies,
            },
            getCurrentProxy: vi.fn(() => proxies[index]),
            markProxyFailed: vi.fn(() => {
                index = 1;
            }),
            getDispatcherForProxy: vi.fn((proxyState) => ({
                proxy: proxyState.uri,
            })),
        };

        const wrappedFetch = await loadWrappedFetch(proxyMock);
        const fetchSpy = vi.spyOn(undici, 'fetch');
        fetchSpy.mockRejectedValueOnce(new Error('boom'));
        fetchSpy.mockResolvedValueOnce(new Response('ok'));

        const response = await wrappedFetch('http://example.com/resource', {
            headers: new Headers({
                'x-prefer-proxy': '1',
            }),
        });

        expect(response).toBeInstanceOf(Response);
        expect(fetchSpy).toHaveBeenCalledTimes(2);
        expect(proxyMock.markProxyFailed).toHaveBeenCalledWith('http://proxy1.test');
        expect(proxyMock.getDispatcherForProxy).toHaveBeenCalledWith(proxies[1]);

        const requestArg = fetchSpy.mock.calls[0][0] as Request;
        expect(requestArg.headers.get('x-prefer-proxy')).toBeNull();
    });

    test('drops dispatcher when no next proxy is available', async () => {
        const proxies = buildProxyState();
        const proxyMock = {
            proxyObj: {
                strategy: 'on_retry',
                url_regex: 'example.com',
            },
            proxyUrlHandler: null,
            multiProxy: {
                allProxies: proxies,
            },
            getCurrentProxy: vi.fn(() => proxies[0]),
            markProxyFailed: vi.fn(),
            getDispatcherForProxy: vi.fn((proxyState) => ({
                proxy: proxyState.uri,
            })),
        };

        const wrappedFetch = await loadWrappedFetch(proxyMock);
        const fetchSpy = vi.spyOn(undici, 'fetch');
        fetchSpy.mockRejectedValueOnce(new Error('boom'));
        fetchSpy.mockResolvedValueOnce(new Response('ok'));

        await wrappedFetch('http://example.com/resource', {
            headers: {
                'x-prefer-proxy': '1',
            },
        });

        expect(fetchSpy).toHaveBeenCalledTimes(2);
        expect(fetchSpy.mock.calls[1][1]?.dispatcher).toBeUndefined();
    });
});
