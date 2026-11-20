import { describe, expect, it } from 'vitest';

import { PacProxyAgent } from '@/shims/pac-proxy-agent';

describe('pac-proxy-agent shim', () => {
    it('rejects PAC proxies with a clear error', () => {
        expect(() => new PacProxyAgent()).toThrow('PAC proxies (PAC_URI or PAC_SCRIPT) are not supported on Cloudflare Workers');
    });
});
