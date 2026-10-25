import { PacProxyAgent } from 'pac-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { ProxyAgent } from 'undici';
import { afterEach, describe, expect, it, vi } from 'vitest';

const loadProxy = async (env: Record<string, string>) => {
    vi.resetModules();
    for (const [key, value] of Object.entries(env)) {
        vi.stubEnv(key, value);
    }
    return (await import('@/utils/proxy')).default;
};

const requestTlsOf = (dispatcher: ProxyAgent) => dispatcher[Object.getOwnPropertySymbols(dispatcher).find((s) => s.description === 'request tls settings')!];

describe('proxy', () => {
    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        vi.unstubAllEnvs();
    });

    it('uses PAC proxy when PAC_URI is set', async () => {
        const proxy = await loadProxy({
            PAC_URI: 'http://example.com/proxy.pac',
            PROXY_URI: '',
        });

        expect(proxy.agent).toBeInstanceOf(PacProxyAgent);
        expect(proxy.dispatcher).toBeNull();
        expect(proxy.proxyUri).toBe('http://example.com/proxy.pac');
    });

    it('resolves the PAC script per request for the fetch dispatcher', async () => {
        const proxy = await loadProxy({
            PAC_SCRIPT: `function FindProxyForURL(url, host) {
                if (host === 'direct.test') return 'DIRECT';
                if (host === 'socks4.test') return 'SOCKS4 a:1080';
                if (host === 'mixed.test') return 'SOCKS4 a:1080; proxy proxy.local:8080';
                return 'PROXY proxy.local:8080; DIRECT';
            }`,
            PAC_URI: '',
            PROXY_URI: '',
        });
        const getResolver = vi.spyOn(proxy.agent as PacProxyAgent<string>, 'getResolver');

        expect(proxy.proxyIsPAC).toBe(true);
        expect(await proxy.getDispatcher('https://direct.test/')).toBeNull();
        const dispatcher = await proxy.getDispatcher('https://example.com/');
        expect(dispatcher).toBeInstanceOf(ProxyAgent);
        expect(await proxy.getDispatcher('https://mixed.test/')).toBe(dispatcher);
        await expect(proxy.getDispatcher('https://socks4.test/')).rejects.toThrow('no proxy type undici supports');
        expect(getResolver).toHaveBeenCalledTimes(1);

        (proxy.agent as PacProxyAgent<string>).resolver = () => Promise.resolve('PROXY other.local:9090');
        const swapped = await proxy.getDispatcher('https://example.com/');
        expect(swapped).toBeInstanceOf(ProxyAgent);
        expect(swapped).not.toBe(dispatcher);
        expect(getResolver).toHaveBeenCalledTimes(1);
    });

    it('wraps PAC resolver failures with a clear error', async () => {
        const proxy = await loadProxy({
            PAC_SCRIPT: 'function FindProxyForURL(url, host) { throw new Error("boom"); }',
            PAC_URI: '',
            PROXY_URI: '',
        });

        await expect(proxy.getDispatcher('https://example.com/')).rejects.toThrow('PAC proxy resolution failed for https://example.com/');
    });

    it('creates a socks proxy agent for single proxy settings', async () => {
        const proxy = await loadProxy({
            PROXY_URI: 'socks5://proxy.local:1080',
            PAC_URI: '',
        });

        expect(proxy.agent).toBeInstanceOf(SocksProxyAgent);
        expect(proxy.dispatcher).toBeInstanceOf(ProxyAgent);
        expect(proxy.proxyUri).toBe('socks5://proxy.local:1080');
        expect(requestTlsOf(proxy.dispatcher!).ALPNProtocols).toEqual(['h2', 'http/1.1']);
    });

    it('creates a socks5 dispatcher for socks5h proxies', async () => {
        const proxy = await loadProxy({
            PROXY_URI: 'socks5h://proxy.local:1080',
            PAC_URI: '',
        });

        expect(proxy.agent).toBeInstanceOf(SocksProxyAgent);
        expect(proxy.dispatcher).toBeInstanceOf(ProxyAgent);
        expect(proxy.proxyUri).toBe('socks5h://proxy.local:1080');
    });

    it('disables socks4 proxies instead of failing to start', async () => {
        const proxy = await loadProxy({
            PROXY_URI: 'socks4://proxy.local:1080',
            PAC_URI: '',
        });

        expect(proxy.agent).toBeNull();
        expect(proxy.dispatcher).toBeNull();
        expect(proxy.proxyUri).toBeUndefined();
        expect(await proxy.getDispatcher('http://example.com')).toBeNull();
    });

    it('prefers h2 on the http proxy dispatcher', async () => {
        const proxy = await loadProxy({
            PROXY_URI: 'http://proxy.local:8080',
            PAC_URI: '',
        });

        expect(proxy.dispatcher).toBeInstanceOf(ProxyAgent);
        expect(requestTlsOf(proxy.dispatcher!).preferH2).toBe(true);
        expect(await proxy.getDispatcher('http://example.com')).toBe(proxy.dispatcher);
        expect(proxy.proxyIsPAC).toBe(false);
    });

    it('applies minVersion to the proxy dispatcher request tls', async () => {
        const proxy = await loadProxy({
            PROXY_URI: 'http://proxy.local:8080',
            PAC_URI: '',
        });

        const dispatcher = (await proxy.getDispatcher('http://example.com', 'TLSv1.3'))!;
        expect(requestTlsOf(dispatcher).minVersion).toBe('TLSv1.3');
        expect(await proxy.getDispatcher('http://other.example', 'TLSv1.3')).toBe(dispatcher);
        expect(requestTlsOf(proxy.dispatcher!).minVersion).toBeUndefined();
    });
});
