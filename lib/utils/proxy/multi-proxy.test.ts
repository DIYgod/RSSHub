import { describe, expect, it, vi } from 'vitest';

import createMultiProxy from '@/utils/proxy/multi-proxy';

const baseProxyObj = {
    protocol: undefined,
    host: undefined,
    port: undefined,
    auth: undefined,
    url_regex: '.*',
    strategy: 'all',
};

describe('multi-proxy', () => {
    it('returns empty results when no valid proxy is provided', () => {
        const result = createMultiProxy(['http://inv lid.test'], baseProxyObj);

        expect(result.allProxies).toHaveLength(0);
        expect(result.getNextProxy()).toBeNull();
        expect(() => result.resetProxy('http://inv lid.test')).not.toThrow();
    });

    it('rotates proxies, marks inactive, and reactivates after health checks', () => {
        vi.useFakeTimers();
        try {
            const result = createMultiProxy(['http://proxy1.local:8080', 'http://proxy2.local:8081'], {
                ...baseProxyObj,
                healthCheckInterval: 20,
            });

            const first = result.getNextProxy();
            expect(first).not.toBeNull();

            const firstUri = first!.uri;
            const secondUri = result.allProxies.find((proxy) => proxy.uri !== firstUri)!.uri;

            result.markProxyFailed(firstUri);
            result.markProxyFailed(firstUri);
            result.markProxyFailed(firstUri);

            const firstState = result.allProxies.find((proxy) => proxy.uri === firstUri)!;
            expect(firstState.isActive).toBe(false);

            result.markProxyFailed(secondUri);
            result.markProxyFailed(secondUri);
            result.markProxyFailed(secondUri);
            expect(result.getNextProxy()).toBeNull();

            vi.advanceTimersByTime(45);
            expect(firstState.isActive).toBe(true);

            result.resetProxy(firstUri);
            expect(firstState.failureCount).toBe(0);
        } finally {
            vi.clearAllTimers();
            vi.useRealTimers();
        }
    });

    it('returns null when proxies become inactive during selection', () => {
        const result = createMultiProxy(['http://proxy1.local:8080', 'http://proxy2.local:8081'], baseProxyObj);

        for (const proxy of result.allProxies) {
            let calls = 0;
            Object.defineProperty(proxy, 'isActive', {
                configurable: true,
                get() {
                    calls += 1;
                    return calls === 1;
                },
            });
        }

        expect(result.getNextProxy()).toBeNull();
    });
});
