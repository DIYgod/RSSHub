import { describe, expect, it, vi } from 'vitest';

const errorSpy = vi.fn();
const warnSpy = vi.fn();
const infoSpy = vi.fn();

vi.mock('@/utils/logger', () => ({
    default: {
        error: errorSpy,
        warn: warnSpy,
        info: infoSpy,
    },
}));

describe('pac-proxy', () => {
    it('logs error when PAC_SCRIPT is not a string', async () => {
        const pacProxy = (await import('@/utils/proxy/pac-proxy')).default;
        pacProxy(undefined, { invalid: true } as any, {});

        expect(errorSpy).toHaveBeenCalledWith('Invalid PAC_SCRIPT, use PAC_URI instead');
    });
});
