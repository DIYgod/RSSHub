import { describe, expect, it, vi } from 'vitest';

// Stands in for the real class: like it, startAndWaitForPorts() leaves a running container alone
vi.mock('@cloudflare/containers', () => ({
    Container: class {
        envVars?: Record<string, string>;
        runningWith?: Record<string, string>;
        destroy() {
            this.runningWith = undefined;
            return Promise.resolve();
        }
        startAndWaitForPorts() {
            this.runningWith ??= this.envVars;
            return Promise.resolve();
        }
    },
}));

describe('container worker', () => {
    it('replaces a running container when the config in KV changes', async () => {
        const { RSSHubContainer } = await import('@/container');
        const container = new RSSHubContainer({} as never, {} as never) as InstanceType<typeof RSSHubContainer> & { runningWith?: Record<string, string> };
        const destroy = vi.spyOn(container, 'destroy');

        await container.startWithEnvVars({ NODE_ENV: 'production', CACHE_EXPIRE: '300' });
        expect(container.runningWith).toEqual({ NODE_ENV: 'production', CACHE_EXPIRE: '300' });
        destroy.mockClear();

        // unchanged (order does not matter)
        await container.startWithEnvVars({ CACHE_EXPIRE: '300', NODE_ENV: 'production' });
        expect(destroy).not.toHaveBeenCalled();

        // added
        await container.startWithEnvVars({ NODE_ENV: 'production', CACHE_EXPIRE: '300', ACCESS_KEY: 'old' });
        expect(destroy).toHaveBeenCalledTimes(1);
        expect(container.runningWith).toEqual({ NODE_ENV: 'production', CACHE_EXPIRE: '300', ACCESS_KEY: 'old' });

        // replaced
        await container.startWithEnvVars({ NODE_ENV: 'production', CACHE_EXPIRE: '300', ACCESS_KEY: 'new' });
        expect(destroy).toHaveBeenCalledTimes(2);
        expect(container.runningWith).toEqual({ NODE_ENV: 'production', CACHE_EXPIRE: '300', ACCESS_KEY: 'new' });

        // removed
        await container.startWithEnvVars({ NODE_ENV: 'production', ACCESS_KEY: 'new' });
        expect(destroy).toHaveBeenCalledTimes(3);
        expect(container.runningWith).toEqual({ NODE_ENV: 'production', ACCESS_KEY: 'new' });
    });
});
