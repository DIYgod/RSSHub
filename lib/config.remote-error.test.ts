import { afterEach, describe, expect, it, vi } from 'vitest';

const errorSpy = vi.fn();
const infoSpy = vi.fn();
const ofetchMock = vi.fn();

const setupMocks = () => {
    vi.resetModules();
    vi.doMock('@/utils/logger', () => ({
        default: {
            error: errorSpy,
            info: infoSpy,
        },
    }));
    vi.doMock('ofetch', () => ({
        ofetch: ofetchMock,
    }));
};

afterEach(() => {
    vi.clearAllMocks();
    vi.unmock('@/utils/logger');
    vi.unmock('ofetch');
    ofetchMock.mockReset();
});

describe('config remote errors', () => {
    it('logs when remote config returns empty', async () => {
        process.env.REMOTE_CONFIG = 'http://rsshub.test/empty';
        setupMocks();
        ofetchMock.mockResolvedValueOnce(null);
        await import('@/config');
        await vi.waitFor(() => {
            expect(errorSpy).toHaveBeenCalledWith('Remote config load failed.');
        });

        delete process.env.REMOTE_CONFIG;
    });

    it('logs when remote config throws', async () => {
        process.env.REMOTE_CONFIG = 'http://rsshub.test/fail';
        const error = new Error('boom');
        setupMocks();
        ofetchMock.mockRejectedValueOnce(error);
        await import('@/config');
        await vi.waitFor(() => {
            expect(errorSpy).toHaveBeenCalledWith('Remote config load failed.', error);
        });

        delete process.env.REMOTE_CONFIG;
    });
});
