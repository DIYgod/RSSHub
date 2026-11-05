import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { config, setConfig } from '@/config';
import logger from '@/utils/logger.worker';

const originalLoggerLevel = config.loggerLevel;
const consoleMocks = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
};

beforeEach(() => {
    setConfig({ LOGGER_LEVEL: '' });
    vi.stubGlobal('console', { ...console, ...consoleMocks });
});

afterEach(() => {
    setConfig({ LOGGER_LEVEL: originalLoggerLevel });
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

describe('worker logger levels', () => {
    it('defaults to info and suppresses detailed logs that can contain credentials', () => {
        expect(config.loggerLevel).toBe('info');
        logger.error('error');
        logger.warn('warning');
        logger.info('info');
        logger.http('request');
        logger.verbose('details');
        logger.debug('cookie=fake-test-secret');
        logger.silly('details');

        expect(consoleMocks.error).toHaveBeenCalledOnce();
        expect(consoleMocks.warn).toHaveBeenCalledOnce();
        expect(consoleMocks.info).toHaveBeenCalledOnce();
        expect(consoleMocks.debug).not.toHaveBeenCalled();
        expect(consoleMocks.log).not.toHaveBeenCalled();
    });

    it('honors a more restrictive configured level', () => {
        setConfig({ LOGGER_LEVEL: 'warn' });
        logger.error('error');
        logger.warn('warning');
        logger.info('info');
        logger.log('info', 'dynamic info');

        expect(consoleMocks.error).toHaveBeenCalledOnce();
        expect(consoleMocks.warn).toHaveBeenCalledOnce();
        expect(consoleMocks.info).not.toHaveBeenCalled();
        expect(consoleMocks.log).not.toHaveBeenCalled();
    });

    it('allows explicitly enabled debug logs and preserves metadata', () => {
        setConfig({ LOGGER_LEVEL: 'debug' });
        const meta = { source: 'test' };
        logger.http('request');
        logger.verbose('details');
        logger.debug('debug details', meta);
        logger.silly('silly details');

        expect(consoleMocks.log).toHaveBeenCalledTimes(2);
        expect(consoleMocks.debug).toHaveBeenCalledExactlyOnceWith(expect.stringContaining('debug: debug details'), meta);
    });

    it('applies filtering to the generic log method and rejects unknown levels', () => {
        logger.log('debug', 'cookie=fake-test-secret');
        logger.log('unknown', 'unknown details');
        logger.log('constructor', 'invalid level');
        expect(consoleMocks.log).not.toHaveBeenCalled();

        logger.log('warn', 'warning', { source: 'test' });
        expect(consoleMocks.log).toHaveBeenCalledExactlyOnceWith(expect.stringContaining('warn: warning'), { source: 'test' });
    });

    it('does not enable detailed logs for an invalid configured level', () => {
        setConfig({ LOGGER_LEVEL: 'unknown' });
        logger.debug('cookie=fake-test-secret');
        logger.log('debug', 'cookie=fake-test-secret');
        expect(consoleMocks.debug).not.toHaveBeenCalled();
        expect(consoleMocks.log).not.toHaveBeenCalled();
    });
});
