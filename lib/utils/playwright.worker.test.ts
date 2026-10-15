import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { config } from '@/config';

import { getPlaywrightPage, setBrowserBinding, setBrowserSessionBinding } from './playwright.worker';

const { playwrightWSEndpoint } = config;
const mocks = vi.hoisted(() => ({ launch: vi.fn(), newContext: vi.fn(), newPage: vi.fn(), goto: vi.fn(), close: vi.fn(), contextClose: vi.fn(), connect: vi.fn(), cloudConnect: vi.fn(), sessionFetch: vi.fn() }));
vi.mock('@cloudflare/playwright', () => ({ launch: mocks.launch, connect: mocks.cloudConnect }));
vi.mock('./playwright-remote.worker', () => ({ connectRemotePlaywright: mocks.connect, setPlaywrightServiceBinding: vi.fn() }));

beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    config.playwrightWSEndpoint = undefined;
    mocks.goto.mockResolvedValue(undefined);
    mocks.newPage.mockResolvedValue({ goto: mocks.goto });
    mocks.newContext.mockResolvedValue({ newPage: mocks.newPage, close: mocks.contextClose });
    mocks.launch.mockResolvedValue({ newContext: mocks.newContext, close: mocks.close });
    mocks.connect.mockResolvedValue({ newContext: mocks.newContext, close: mocks.close });
    mocks.cloudConnect.mockResolvedValue({ newContext: mocks.newContext, close: mocks.close });
    mocks.sessionFetch.mockImplementation(() => Promise.resolve(Response.json({ sessionId: 'shared-session' })));
    setBrowserBinding({});
    setBrowserSessionBinding();
});

function useSessionCoordinator() {
    const get = vi.fn(() => ({ fetch: mocks.sessionFetch }));
    const idFromName = vi.fn(() => 'durable-object-id');
    setBrowserSessionBinding({ get, idFromName } as unknown as Parameters<typeof setBrowserSessionBinding>[0]);
    return { get, idFromName };
}

afterEach(() => {
    vi.useRealTimers();
    config.playwrightWSEndpoint = playwrightWSEndpoint;
});

describe('Worker browser lifecycle', () => {
    it('prefers the configured ordinary WebSocket server over BROWSER', async () => {
        useSessionCoordinator();
        config.playwrightWSEndpoint = 'wss://browser.example/playwright?token=test';
        const { destroy } = await getPlaywrightPage('about:blank', { noGoto: true, javaScriptEnabled: false });
        expect(mocks.connect).toHaveBeenCalledWith(config.playwrightWSEndpoint);
        expect(mocks.launch).not.toHaveBeenCalled();
        expect(mocks.sessionFetch).not.toHaveBeenCalled();
        expect(mocks.cloudConnect).not.toHaveBeenCalled();
        expect(mocks.newContext).toHaveBeenCalledWith({ ignoreHTTPSErrors: true, javaScriptEnabled: false });
        await Promise.all([destroy(), destroy()]);
        expect(mocks.contextClose).toHaveBeenCalledOnce();
        expect(mocks.close).toHaveBeenCalledOnce();
    });

    it('connects to the shared session instead of launching a browser', async () => {
        const { idFromName } = useSessionCoordinator();
        const { destroy } = await getPlaywrightPage('about:blank', { noGoto: true });
        expect(idFromName).toHaveBeenCalledWith('rsshub-browser');
        expect(mocks.cloudConnect).toHaveBeenCalledWith({}, 'shared-session');
        expect(mocks.launch).not.toHaveBeenCalled();
        await destroy();
        expect(mocks.contextClose).toHaveBeenCalledOnce();
        expect(mocks.close).toHaveBeenCalledOnce();
    });

    it('isolates simultaneous requests and cleans up only their own context', async () => {
        useSessionCoordinator();
        const contexts = [
            { newPage: mocks.newPage, close: vi.fn() },
            { newPage: mocks.newPage, close: vi.fn() },
        ];
        mocks.newContext.mockResolvedValueOnce(contexts[0]).mockResolvedValueOnce(contexts[1]);
        const pages = await Promise.all([getPlaywrightPage('about:blank', { noGoto: true }), getPlaywrightPage('about:blank', { noGoto: true })]);
        expect(mocks.cloudConnect).toHaveBeenCalledTimes(2);
        expect(mocks.newContext).toHaveBeenCalledTimes(2);
        expect(pages[0].context).not.toBe(pages[1].context);
        await pages[0].destroy();
        expect(contexts[0].close).toHaveBeenCalledOnce();
        expect(contexts[1].close).not.toHaveBeenCalled();
        await pages[1].destroy();
        expect(contexts[1].close).toHaveBeenCalledOnce();
    });

    it('replaces an expired session once and reconnects', async () => {
        useSessionCoordinator();
        mocks.cloudConnect.mockRejectedValueOnce(new Error('Unable to connect to browser: code: 404: message: Session not found'));
        mocks.sessionFetch.mockResolvedValueOnce(Response.json({ sessionId: 'expired' })).mockResolvedValueOnce(Response.json({ sessionId: 'replacement' }));
        const { destroy } = await getPlaywrightPage('about:blank', { noGoto: true });
        expect(mocks.sessionFetch.mock.calls[1][1].body).toBe(JSON.stringify({ invalidSessionId: 'expired' }));
        expect(mocks.cloudConnect).toHaveBeenNthCalledWith(2, {}, 'replacement');
        await destroy();
        expect(mocks.launch).not.toHaveBeenCalled();
    });

    it.each(['Connection refused', 'Unable to connect to browser: code: 429: message: Too many connections'])('preserves a healthy session after %s', async (message) => {
        useSessionCoordinator();
        mocks.cloudConnect.mockRejectedValueOnce(new Error(message));
        await expect(getPlaywrightPage('about:blank', { noGoto: true })).rejects.toThrow(message);
        expect(mocks.sessionFetch).toHaveBeenCalledOnce();
        expect(mocks.launch).not.toHaveBeenCalled();
    });

    it('propagates a second expired-session connection failure without a retry loop', async () => {
        useSessionCoordinator();
        mocks.cloudConnect.mockRejectedValue(new Error('Unable to connect to browser: code: 404: message: Session not found'));
        await expect(getPlaywrightPage('about:blank', { noGoto: true })).rejects.toThrow('404');
        expect(mocks.sessionFetch).toHaveBeenCalledTimes(2);
        expect(mocks.cloudConnect).toHaveBeenCalledTimes(2);
    });

    it.each([Response.json({}, { status: 503 }), Response.json({}), Response.json({ sessionId: 123 })])('rejects invalid coordinator responses', async (response) => {
        useSessionCoordinator();
        mocks.sessionFetch.mockResolvedValueOnce(response);
        await expect(getPlaywrightPage('about:blank', { noGoto: true })).rejects.toThrow(/session/i);
        expect(mocks.cloudConnect).not.toHaveBeenCalled();
        expect(mocks.launch).not.toHaveBeenCalled();
    });

    it('retains the launch fallback when the optional coordinator is absent', async () => {
        const { destroy } = await getPlaywrightPage('about:blank', { noGoto: true });
        expect(mocks.launch).toHaveBeenCalledWith({}, { keep_alive: 60000 });
        expect(mocks.cloudConnect).not.toHaveBeenCalled();
        await destroy();
    });

    it('requires a configured endpoint when explicitly requested', async () => {
        await expect(getPlaywrightPage('about:blank', { useConfiguredEndpoint: true })).rejects.toThrow('PLAYWRIGHT_WS_ENDPOINT');
        expect(mocks.launch).not.toHaveBeenCalled();
    });

    it('does not silently switch to BROWSER when the configured endpoint fails', async () => {
        config.playwrightWSEndpoint = 'wss://browser.example/playwright';
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
        useSessionCoordinator();
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
        expect(mocks.cloudConnect).toHaveBeenCalledOnce();
        expect(mocks.launch).not.toHaveBeenCalled();
        expect(mocks.close).toHaveBeenCalledOnce();
        await vi.advanceTimersByTimeAsync(30000);
        expect(mocks.close).toHaveBeenCalledOnce();
    });
});
