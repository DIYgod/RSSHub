import type { BrowserType } from 'patchright';

import { getPlaywrightCore } from '../../assets/build/playwright-worker.mjs';
import { installNativeTransport, type TransportFetch, type TransportServer, withTransportFetch } from './playwright-transport.worker';

export type PlaywrightService = { fetch: TransportFetch };
let playwrightService: PlaywrightService | undefined;
let serviceOrigin: string | undefined;
let clientPromise: Promise<BrowserType> | undefined;

export const setPlaywrightServiceBinding = (binding?: PlaywrightService, origin?: string) => {
    playwrightService = binding;
    serviceOrigin = origin;
};

const getClient = () =>
    (clientPromise ??= (async () => {
        const core = await getPlaywrightCore();
        installNativeTransport(core.server as unknown as TransportServer);
        return core.inprocess.playwright.chromium;
    })());

export const connectRemotePlaywright = async (endpoint: string) => {
    const url = new URL(endpoint);
    url.protocol = url.protocol === 'wss:' ? 'https:' : url.protocol === 'ws:' ? 'http:' : url.protocol;
    // Only route credentials through a service binding when its configured origin matches.
    const binding = playwrightService;
    const useBinding = binding && serviceOrigin && url.origin === new URL(serviceOrigin).origin;
    const client = await getClient();
    const connect = () => client.connect(endpoint, { timeout: 20000 });
    return useBinding ? withTransportFetch(binding.fetch.bind(binding), connect) : connect();
};
