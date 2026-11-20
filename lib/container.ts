// Cloudflare Container Worker entry point
// This Worker manages the RSSHub container lifecycle and proxies requests

import { Container } from '@cloudflare/containers';
import type { DurableObjectNamespace, KVNamespace } from '@cloudflare/workers-types';

const INSTANCE_COUNT = 20;

export class RSSHubContainer extends Container {
    defaultPort = 1200;
    sleepAfter = '10m';
    enableInternet = true;

    // a running container keeps the env vars it was started with, so replace it when the config in KV changes
    async startWithEnvVars(envVars: Record<string, string>): Promise<void> {
        const current = this.envVars ?? {};
        const changed = Object.keys(current).length !== Object.keys(envVars).length || Object.entries(envVars).some(([name, value]) => current[name] !== value);

        // Kept on the instance so that every later (re)start, including the one in fetch(), uses them too
        this.envVars = envVars;
        if (changed) {
            // No-op when the container is not running
            await this.destroy();
        }

        await this.startAndWaitForPorts();
    }

    // always target the port RSSHub listens on
    fetch(request: Request): Promise<Response> {
        return this.containerFetch(request, this.defaultPort);
    }
}

interface Env {
    RSSHUB_CONTAINER: DurableObjectNamespace;
    CONFIG: KVNamespace;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        // Load env vars from KV
        const envVars = new Map<string, string>([['NODE_ENV', 'production']]);

        const keys = await env.CONFIG.list();
        await Promise.all(
            keys.keys.map(async ({ name }) => {
                const value = await env.CONFIG.get(name);
                if (value) {
                    envVars.set(name, value);
                }
            })
        );

        // Randomly select an instance for load balancing
        const instanceIndex = Math.floor(Math.random() * INSTANCE_COUNT);
        const container = env.RSSHUB_CONTAINER.getByName(`rsshub-${instanceIndex}`) as unknown as RSSHubContainer;

        // Start container with env vars and wait for port to be ready
        await container.startWithEnvVars(Object.fromEntries(envVars));

        return container.fetch(request);
    },
};
