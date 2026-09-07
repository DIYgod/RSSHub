import { afterEach, describe, expect, it, vi } from 'vitest';

const serve = vi.fn<(...args: any[]) => any>(() => ({ close: vi.fn() }));
const listen = vi.fn();
const createAdaptorServer = vi.fn<(...args: any[]) => any>(() => ({ listen, close: vi.fn() }));
const rmSync = vi.fn();
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
    createAdaptorServer,
}));
vi.mock('node:fs', () => ({
    __esModule: true,
    default: {
        rmSync,
    },
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
        createAdaptorServer.mockClear();
        listen.mockClear();
        rmSync.mockClear();
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
        expect(createAdaptorServer).not.toHaveBeenCalled();
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

    it('listens on a unix socket instead of a port when SOCKET is set', async () => {
        vi.stubEnv('ENABLE_CLUSTER', '');
        vi.stubEnv('LISTEN_INADDR_ANY', '');
        vi.stubEnv('SOCKET', '/tmp/rsshub-test.sock');
        vi.stubEnv('PORT', 'null');

        const module = await import('@/index');
        expect(module.default).toBeDefined();
        expect(rmSync).toHaveBeenCalledWith('/tmp/rsshub-test.sock', { force: true });
        expect(createAdaptorServer).toHaveBeenCalledTimes(1);
        expect(createAdaptorServer.mock.calls[0][0]).toMatchObject({
            hostname: '127.0.0.1',
        });
        expect(listen).toHaveBeenCalledWith('/tmp/rsshub-test.sock');
        expect(serve).not.toHaveBeenCalled();
    });

    it('cluster primary removes a stale unix socket before forking', async () => {
        clusterState.isPrimary = true;
        vi.stubEnv('ENABLE_CLUSTER', 'true');
        vi.stubEnv('SOCKET', '/tmp/rsshub-test.sock');
        availableParallelism.mockReturnValue(2);

        await import('@/index');

        expect(rmSync).toHaveBeenCalledWith('/tmp/rsshub-test.sock', { force: true });
        expect(fork).toHaveBeenCalledTimes(2);
        expect(createAdaptorServer).not.toHaveBeenCalled();
        expect(serve).not.toHaveBeenCalled();
    });

    it('cluster worker listens on the unix socket without removing it', async () => {
        clusterState.isPrimary = false;
        vi.stubEnv('ENABLE_CLUSTER', 'true');
        vi.stubEnv('SOCKET', '/tmp/rsshub-test.sock');

        await import('@/index');

        expect(rmSync).not.toHaveBeenCalled();
        expect(createAdaptorServer).toHaveBeenCalledTimes(1);
        expect(listen).toHaveBeenCalledWith('/tmp/rsshub-test.sock');
        expect(serve).not.toHaveBeenCalled();
    });
});
