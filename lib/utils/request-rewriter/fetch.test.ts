import { getCurrentCell, setCurrentCell } from 'node-network-devtools';
import undici from 'undici';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

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

    test('should register request with custom headers in dev environment', async () => {
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

        await useCustomHeader(headers);

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

    test('should not register request in non-dev environment', async () => {
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
        await useCustomHeader(headers);

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
    test('throws when fetch fails', async () => {
        const fetchSpy = vi.spyOn(undici, 'fetch').mockRejectedValueOnce(new Error('boom'));

        await expect(wrappedFetch('http://example.com')).rejects.toThrow('boom');

        fetchSpy.mockRestore();
    });

    test('installs a global dispatcher that prefers h2 in ALPN', () => {
        const dispatcher = undici.getGlobalDispatcher();
        const optionsKey = Object.getOwnPropertySymbols(dispatcher).find((s) => s.description === 'options')!;
        expect(dispatcher[optionsKey].connect.preferH2).toBe(true);
    });
});
