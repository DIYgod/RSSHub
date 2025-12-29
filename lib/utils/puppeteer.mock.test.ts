import { describe, expect, it, vi } from 'vitest';

const connect = vi.fn();
const launch = vi.fn();

const page = {
    goto: vi.fn(),
    authenticate: vi.fn(),
};

const browser = {
    newPage: vi.fn(() => Promise.resolve(page)),
    close: vi.fn(),
};

const proxyMock = {
    proxyObj: { url_regex: '.*' },
    proxyUrlHandler: new URL('http://proxy.local'),
    multiProxy: undefined as any,
    getCurrentProxy: vi.fn(),
    markProxyFailed: vi.fn(),
    getDispatcherForProxy: vi.fn(),
};

vi.mock('rebrowser-puppeteer', () => ({
    default: {
        connect,
        launch,
    },
}));

vi.mock('@/utils/proxy', () => ({
    default: proxyMock,
}));

vi.mock('@/utils/logger', () => ({
    default: {
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

const loadPuppeteer = async () => {
    vi.resetModules();
    const mod = await import('@/utils/puppeteer');
    return mod.getPuppeteerPage;
};

describe('getPuppeteerPage (mocked)', () => {
    it('connects via ws endpoint and runs onBeforeLoad', async () => {
        connect.mockResolvedValue(browser);
        launch.mockResolvedValue(browser);
        page.goto.mockResolvedValue(undefined);
        page.authenticate.mockResolvedValue(undefined);
        browser.close.mockResolvedValue(undefined);

        process.env.PUPPETEER_WS_ENDPOINT = 'ws://localhost:3000/?token=abc';
        proxyMock.getCurrentProxy.mockReturnValue(null);

        const getPuppeteerPage = await loadPuppeteer();
        const onBeforeLoad = vi.fn();
        const result = await getPuppeteerPage('https://example.com', {
            noGoto: true,
            onBeforeLoad,
        });

        const endpoint = connect.mock.calls[0][0].browserWSEndpoint as string;
        expect(endpoint).toContain('launch=');
        expect(endpoint).toContain('stealth=true');
        expect(onBeforeLoad).toHaveBeenCalled();

        await result.destory();
        expect(browser.close).toHaveBeenCalled();

        delete process.env.PUPPETEER_WS_ENDPOINT;
    });

    it('marks proxy failed when navigation throws with multi-proxy', async () => {
        connect.mockResolvedValue(browser);
        launch.mockResolvedValue(browser);
        page.goto.mockRejectedValueOnce(new Error('fail'));
        page.authenticate.mockResolvedValue(undefined);

        const currentProxy = {
            uri: 'http://user:pass@proxy.local:8080',
            urlHandler: new URL('http://user:pass@proxy.local:8080'),
        };
        proxyMock.multiProxy = {};
        proxyMock.getCurrentProxy.mockReturnValue(currentProxy);

        const getPuppeteerPage = await loadPuppeteer();
        await expect(getPuppeteerPage('https://example.com')).rejects.toThrow('fail');

        expect(proxyMock.markProxyFailed).toHaveBeenCalledWith(currentProxy.uri);
    });

    it('rethrows navigation errors without multi-proxy', async () => {
        connect.mockResolvedValue(browser);
        launch.mockResolvedValue(browser);
        page.goto.mockRejectedValueOnce(new Error('fail'));

        proxyMock.multiProxy = undefined;
        proxyMock.getCurrentProxy.mockReturnValue(null);

        const getPuppeteerPage = await loadPuppeteer();
        await expect(getPuppeteerPage('https://example.com')).rejects.toThrow('fail');
    });
});
