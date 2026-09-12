import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getPlaywrightPage, setBrowserBinding } from '../lib/utils/playwright.worker';

const mocks = vi.hoisted(() => ({ endpoint: undefined as string | undefined, launch: vi.fn(), newContext: vi.fn(), newPage: vi.fn(), goto: vi.fn(), close: vi.fn(), contextClose: vi.fn(), connect: vi.fn() }));
vi.mock('@cloudflare/playwright', () => ({ launch: mocks.launch }));
vi.mock('../lib/utils/playwright-remote.worker', () => ({ connectRemotePlaywright: mocks.connect, setPlaywrightServiceBinding: vi.fn() }));
vi.mock('../lib/config', () => ({
    config: {
        get playwrightWSEndpoint() {
            return mocks.endpoint;
        },
    },
}));
vi.mock('../lib/utils/logger', () => ({ default: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() } }));

beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.endpoint = undefined;
    mocks.goto.mockResolvedValue(undefined);
    mocks.newPage.mockResolvedValue({ goto: mocks.goto });
    mocks.newContext.mockResolvedValue({ newPage: mocks.newPage, close: mocks.contextClose });
    mocks.launch.mockResolvedValue({ newContext: mocks.newContext, close: mocks.close });
    mocks.connect.mockResolvedValue({ newContext: mocks.newContext, close: mocks.close });
    setBrowserBinding({});
});

afterEach(() => {
    vi.useRealTimers();
});

describe('Worker browser lifecycle', () => {
    it('prefers the configured ordinary WebSocket server over BROWSER', async () => {
        mocks.endpoint = 'wss://browser.example/playwright?token=test';
        const { destroy } = await getPlaywrightPage('about:blank', { noGoto: true, javaScriptEnabled: false });
        expect(mocks.connect).toHaveBeenCalledWith(mocks.endpoint);
        expect(mocks.launch).not.toHaveBeenCalled();
        expect(mocks.newContext).toHaveBeenCalledWith({ ignoreHTTPSErrors: true, javaScriptEnabled: false });
        await Promise.all([destroy(), destroy()]);
        expect(mocks.contextClose).toHaveBeenCalledOnce();
        expect(mocks.close).toHaveBeenCalledOnce();
    });

    it('requires a configured endpoint when explicitly requested', async () => {
        await expect(getPlaywrightPage('about:blank', { useConfiguredEndpoint: true })).rejects.toThrow('PLAYWRIGHT_WS_ENDPOINT');
        expect(mocks.launch).not.toHaveBeenCalled();
    });

    it('does not silently switch to BROWSER when the configured endpoint fails', async () => {
        mocks.endpoint = 'wss://browser.example/playwright';
        mocks.connect.mockRejectedValueOnce(new Error('Connection refused'));
        await expect(getPlaywrightPage('about:blank')).rejects.toThrow('Connection refused');
        expect(mocks.launch).not.toHaveBeenCalled();
    });

    it('disconnects even when closing the context fails', async () => {
        mocks.contextClose.mockRejectedValueOnce(new Error('Context close failed'));
        const { destroy } = await getPlaywrightPage('about:blank', { noGoto: true });
        await expect(destroy()).rejects.toThrow('Context close failed');
        expect(mocks.close).toHaveBeenCalledOnce();
    });

    it('disconnects if the context close RPC never settles', async () => {
        mocks.contextClose.mockReturnValueOnce(new Promise(() => {}));
        const { destroy } = await getPlaywrightPage('about:blank', { noGoto: true });
        const closing = expect(destroy()).rejects.toThrow('cleanup timed out');
        await vi.advanceTimersByTimeAsync(5000);
        await closing;
        expect(mocks.close).toHaveBeenCalledOnce();
    });

    it('keeps a shared browser alive for the requested lifetime and closes it immediately on cleanup', async () => {
        const { destroy } = await getPlaywrightPage('https://example.com', { noGoto: true, closeTimeout: 120000 });
        await vi.advanceTimersByTimeAsync(30000);
        expect(mocks.close).not.toHaveBeenCalled();
        await destroy();
        expect(mocks.close).toHaveBeenCalledOnce();
        await vi.advanceTimersByTimeAsync(120000);
        expect(mocks.close).toHaveBeenCalledOnce();
    });

    it('closes the browser if initial navigation fails', async () => {
        mocks.goto.mockRejectedValue(new Error('Navigation failed'));
        await expect(getPlaywrightPage('https://example.com')).rejects.toThrow('Navigation failed');
        expect(mocks.close).toHaveBeenCalledOnce();
        await vi.advanceTimersByTimeAsync(30000);
        expect(mocks.close).toHaveBeenCalledOnce();
    });

    it('allows explicit cleanup to own the lifetime of a shared page', async () => {
        const { destroy } = await getPlaywrightPage('https://example.com', { noGoto: true, closeTimeout: 0 });
        await vi.advanceTimersByTimeAsync(180000);
        expect(mocks.close).not.toHaveBeenCalled();
        await destroy();
        expect(mocks.close).toHaveBeenCalledOnce();
    });

    it.each(['context', 'page', 'callback'])('cleans up a failed %s initialization', async (stage) => {
        const failure = new Error('Initialization failed');
        if (stage === 'context') {
            mocks.newContext.mockRejectedValueOnce(failure);
        } else if (stage === 'page') {
            mocks.newPage.mockRejectedValueOnce(failure);
        }
        await expect(
            getPlaywrightPage('https://example.com', {
                noGoto: true,
                onBeforeLoad: () => {
                    if (stage === 'callback') {
                        throw failure;
                    }
                },
            })
        ).rejects.toThrow('Initialization failed');
        expect(mocks.close).toHaveBeenCalledOnce();
        await vi.advanceTimersByTimeAsync(30000);
        expect(mocks.close).toHaveBeenCalledOnce();
    });
});
