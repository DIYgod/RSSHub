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
            PAC_SCRIPT: "function FindProxyForURL(url, host) { return host === 'direct.test' ? 'DIRECT' : 'PROXY proxy.local:8080; DIRECT'; }",
            PAC_URI: '',
            PROXY_URI: '',
        });

        expect(await proxy.getDispatcher('https://direct.test/')).toBeNull();
        expect(await proxy.getDispatcher('https://example.com/')).toBeInstanceOf(ProxyAgent);
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
    });

    it('applies minVersion to the proxy dispatcher request tls', async () => {
        const proxy = await loadProxy({
            PROXY_URI: 'http://proxy.local:8080',
            PAC_URI: '',
        });

        const dispatcher = (await proxy.getDispatcher('http://example.com', 'TLSv1.3'))!;
        expect(requestTlsOf(dispatcher).minVersion).toBe('TLSv1.3');
        expect(requestTlsOf(proxy.dispatcher!).minVersion).toBeUndefined();
    });
});
