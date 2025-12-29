import { describe, expect, it, vi } from 'vitest';

describe('logger', () => {
    it('formats console transport output', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        process.env.SHOW_LOGGER_TIMESTAMP = 'true';

        vi.resetModules();
        const logger = (await import('@/utils/logger')).default;
        const consoleTransport = logger.transports.find((transport) => transport.constructor.name === 'Console') as any;
        const format = consoleTransport?.format;

        const info = {
            level: 'info',
            message: 'hello',
            timestamp: '2024-01-01 00:00:00.000',
        };
        const transformed = format?.transform ? format.transform(info) : info;

        expect(transformed).toBeDefined();
        expect(transformed.message).toBe('hello');

        process.env.NODE_ENV = originalEnv;
        delete process.env.SHOW_LOGGER_TIMESTAMP;
    });
});
