// Cloudflare Container Worker entry point
// This Worker manages the RSSHub container lifecycle and proxies requests

import { Container } from '@cloudflare/containers';
import type { KVNamespace } from '@cloudflare/workers-types';

const INSTANCE_COUNT = 20;

export class RSSHubContainer extends Container {
    defaultPort = 1200;
    sleepAfter = '10m';
    enableInternet = true;
}

interface Env {
    RSSHUB_CONTAINER: DurableObjectNamespace<RSSHubContainer>;
    CONFIG: KVNamespace;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        // Load env vars from KV
        const envVars: Record<string, string> = {
            NODE_ENV: 'production',
        };

        const keys = await env.CONFIG.list();
        await Promise.all(
            keys.keys.map(async ({ name }) => {
                const value = await env.CONFIG.get(name);
                if (value) {
                    envVars[name] = value;
                }
            })
        );

        // Randomly select an instance for load balancing
        const instanceIndex = Math.floor(Math.random() * INSTANCE_COUNT);
        const container = env.RSSHUB_CONTAINER.getByName(`rsshub-${instanceIndex}`);

        // Start container with env vars and wait for port to be ready
        await container.startAndWaitForPorts({
            startOptions: { envVars },
        });

        return container.fetch(request);
    },
};
