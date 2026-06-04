import { afterEach, describe, expect, it, vi } from 'vitest';

const serve = vi.fn(() => ({ close: vi.fn() }));
const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    http: vi.fn(),
};
const fork = vi.fn();
const clusterState = { isPrimary: true };
const clusterMock = {
    get isPrimary() {
        return clusterState.isPrimary;
    },
    fork,
};
const availableParallelism = vi.fn(() => 2);

vi.mock('@hono/node-server', () => ({
    serve,
}));
vi.mock('@/utils/logger', () => ({
    default: logger,
}));
vi.mock('@/utils/common-utils', () => ({
    getLocalhostAddress: () => ['192.0.2.1'],
}));
vi.mock('@/app', () => ({
    default: { fetch: vi.fn() },
}));
vi.mock('node:cluster', () => ({
    __esModule: true,
    default: clusterMock,
}));
vi.mock('node:os', () => ({
    __esModule: true,
    default: {
        availableParallelism,
    },
}));

describe('index', () => {
    afterEach(() => {
        vi.resetModules();
        vi.unstubAllEnvs();
        serve.mockClear();
        fork.mockClear();
        availableParallelism.mockClear();
        logger.info.mockClear();
        clusterState.isPrimary = true;
    });

    it('starts a server when cluster is disabled', async () => {
        vi.stubEnv('ENABLE_CLUSTER', '');
        vi.stubEnv('LISTEN_INADDR_ANY', '');
        vi.stubEnv('PORT', '12345');

        const module = await import('@/index');
        expect(module.default).toBeDefined();
        expect(serve).toHaveBeenCalledTimes(1);
        expect(serve.mock.calls[0][0]).toMatchObject({
            hostname: '127.0.0.1',
            port: 12345,
        });
    });

    it('forks workers when cluster is enabled and primary', async () => {
        clusterState.isPrimary = true;
        vi.stubEnv('ENABLE_CLUSTER', 'true');
        vi.stubEnv('LISTEN_INADDR_ANY', 'true');
        vi.stubEnv('PORT', '12346');
        availableParallelism.mockReturnValue(2);

        await import('@/index');

        expect(fork).toHaveBeenCalledTimes(2);
        expect(serve).not.toHaveBeenCalled();
    });

    it('starts a worker server when cluster is enabled and not primary', async () => {
        clusterState.isPrimary = false;
        vi.stubEnv('ENABLE_CLUSTER', 'true');
        vi.stubEnv('LISTEN_INADDR_ANY', '');
        vi.stubEnv('PORT', '12347');

        await import('@/index');

        expect(serve).toHaveBeenCalledTimes(1);
        expect(serve.mock.calls[0][0]).toMatchObject({
            hostname: '127.0.0.1',
            port: 12347,
        });
    });
});
