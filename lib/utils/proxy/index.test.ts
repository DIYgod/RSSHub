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

describe('proxy', () => {
    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        vi.unstubAllEnvs();
    });

    it('uses PAC proxy when PAC_URI is set', async () => {
        const proxy = await loadProxy({
            PAC_URI: 'http://example.com/proxy.pac',
            PROXY_URIS: '',
            PROXY_URI: '',
        });

        expect(proxy.agent).toBeInstanceOf(PacProxyAgent);
        expect(proxy.dispatcher).toBeNull();
        expect(proxy.proxyUri).toBe('http://example.com/proxy.pac');

        const current = proxy.getCurrentProxy();
        expect(current?.uri).toBe('http://example.com/proxy.pac');
    });

    it('handles multi-proxy selection and updates after failures', async () => {
        const proxy = await loadProxy({
            PROXY_URIS: 'http://proxy1.local:8080,http://proxy2.local:8081',
            PAC_URI: '',
            PROXY_URI: '',
        });

        expect(proxy.multiProxy).toBeDefined();
        const current = proxy.getCurrentProxy();
        expect(current).not.toBeNull();
        expect(proxy.getDispatcherForProxy(current!)).toBeInstanceOf(ProxyAgent);
        expect(proxy.getAgentForProxy({ uri: 'socks5://proxy.local:1080' } as any)).toBeInstanceOf(SocksProxyAgent);

        proxy.markProxyFailed(current!.uri);
        const next = proxy.getCurrentProxy();
        expect(next).not.toBeNull();
    });

    it('clears proxy when multi-proxy has no valid entries', async () => {
        const proxy = await loadProxy({
            PROXY_URIS: 'http://inv lid.test',
            PAC_URI: '',
            PROXY_URI: '',
        });

        expect(proxy.getCurrentProxy()).toBeNull();
        proxy.markProxyFailed('http://inv lid.test');
        expect(proxy.agent).toBeNull();
        expect(proxy.dispatcher).toBeNull();
        expect(proxy.proxyUri).toBeUndefined();
    });

    it('creates a socks proxy agent for single proxy settings', async () => {
        const proxy = await loadProxy({
            PROXY_URI: 'socks5://proxy.local:1080',
            PROXY_URIS: '',
            PAC_URI: '',
        });

        expect(proxy.agent).toBeInstanceOf(SocksProxyAgent);
        expect(proxy.dispatcher).toBeNull();
        expect(proxy.getCurrentProxy()?.uri).toBe('socks5://proxy.local:1080');
    });

    it('returns null agent for unsupported proxy protocol', async () => {
        const proxy = await loadProxy({
            PROXY_URI: '',
            PROXY_URIS: '',
            PAC_URI: '',
        });

        expect(proxy.getAgentForProxy({ uri: 'ftp://proxy.local:21' } as any)).toBeNull();
    });
});
