// Worker-compatible Playwright with ordinary remote WebSocket and Browser Run support.
import type { BrowserWorker } from '@cloudflare/playwright';
import { connect, launch } from '@cloudflare/playwright';
import type { DurableObjectNamespace, DurableObjectStub } from '@cloudflare/workers-types';
import type { Browser, Page } from 'patchright';

import { config } from '@/config';

import logger from './logger';
import { connectRemotePlaywright } from './playwright-remote.worker';

export { setPlaywrightServiceBinding } from './playwright-remote.worker';

type GotoOptions = Parameters<Page['goto']>[1];
let browserBinding: any;
let browserSessionBinding: DurableObjectNamespace | undefined;

export const setBrowserBinding = (binding: any) => {
    browserBinding = binding;
};

export const setBrowserSessionBinding = (binding?: DurableObjectNamespace) => {
    browserSessionBinding = binding;
};

async function getSessionId(stub: DurableObjectStub, invalidSessionId?: string) {
    const response = await stub.fetch('https://browser-session/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidSessionId ? { invalidSessionId } : {}),
    });
    if (!response.ok) {
        throw new Error(`Browser session acquisition failed (${response.status}). Check the BROWSER and BROWSER_SESSIONS bindings.`);
    }
    const data = await response.json<{ sessionId?: unknown }>();
    if (typeof data.sessionId !== 'string' || !data.sessionId) {
        throw new Error('Browser session coordinator did not return a session ID.');
    }
    return data.sessionId;
}

async function connectSharedBrowser(binding: BrowserWorker, sessions: DurableObjectNamespace) {
    const stub = sessions.get(sessions.idFromName('rsshub-browser'));
    const sessionId = await getSessionId(stub);
    try {
        return await connect(binding, sessionId);
    } catch (error) {
        // Network and quota failures must not replace a session used by other requests.
        if (!(error instanceof Error) || !/Unable to connect to browser: code: (?:400|404|410)\b/.test(error.message)) {
            throw error;
        }
        const replacement = await getSessionId(stub, sessionId);
        return connect(binding, replacement);
    }
}

const launchBrowser = async (options: { javaScriptEnabled?: boolean; useConfiguredEndpoint?: boolean } = {}) => {
    let browser: Browser;
    if (config.playwrightWSEndpoint) {
        browser = await connectRemotePlaywright(config.playwrightWSEndpoint);
    } else {
        if (options.useConfiguredEndpoint) {
            throw new Error('Configure PLAYWRIGHT_WS_ENDPOINT to use the remote Playwright browser.');
        }
        if (!browserBinding) {
            throw new Error('Configure PLAYWRIGHT_WS_ENDPOINT or a Cloudflare BROWSER binding. Browser Run requires remote mode or a deployed Worker.');
        }
        const binding = browserBinding;
        const sessions = browserSessionBinding;
        browser = (sessions ? await connectSharedBrowser(binding, sessions) : await launch(binding, { keep_alive: 60000 })) as unknown as Browser;
    }
    try {
        const context = await browser.newContext({
            ignoreHTTPSErrors: true,
            ...(options.javaScriptEnabled !== undefined && { javaScriptEnabled: options.javaScriptEnabled }),
        });
        return { browser, context };
    } catch (error) {
        await browser.close();
        throw error;
    }
};

const cleanup = ({ browser, context }: Awaited<ReturnType<typeof launchBrowser>>, timeout = 30000) => {
    let closing: Promise<void> | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const destroy = () => {
        clearTimeout(timer);
        return (closing ??= (async () => {
            let contextTimer: ReturnType<typeof setTimeout> | undefined;
            try {
                await Promise.race([
                    context.close(),
                    new Promise<never>((_resolve, reject) => {
                        contextTimer = setTimeout(() => reject(new Error('Playwright context cleanup timed out')), 5000);
                    }),
                ]);
            } finally {
                clearTimeout(contextTimer);
                // Remote Browser.close() disconnects this client; it does not stop the shared server.
                await browser.close();
            }
        })());
    };
    if (timeout !== 0) {
        timer = setTimeout(() => {
            void destroy().catch(() => logger.warn('Playwright browser cleanup failed'));
        }, timeout);
    }
    return destroy;
};

/** @returns Playwright browser context (native newPage() shares state across calls) */
export default async function outPlaywright() {
    const session = await launchBrowser();
    cleanup(session);
    return session.context;
}

/** @returns Playwright page with explicit, idempotent cleanup */
export const getPlaywrightPage = async (
    url: string,
    instanceOptions: {
        // Set to zero only when the caller always awaits destroy() in finally.
        closeTimeout?: number;
        gotoConfig?: GotoOptions;
        javaScriptEnabled?: boolean;
        noGoto?: boolean;
        useConfiguredEndpoint?: boolean;
        onBeforeLoad?: (page: Page, context?: Awaited<ReturnType<typeof launchBrowser>>['context']) => Promise<void> | void;
    } = {}
) => {
    const session = await launchBrowser(instanceOptions);
    const { context } = session;
    const destroy = cleanup(session, instanceOptions.closeTimeout);
    try {
        const page = await context.newPage();
        if (instanceOptions.onBeforeLoad) {
            await instanceOptions.onBeforeLoad(page, context);
        }
        if (!instanceOptions.noGoto) {
            await page.goto(url, instanceOptions.gotoConfig || { waitUntil: 'domcontentloaded' });
        }
        return { context, destroy, page };
    } catch (error) {
        await destroy();
        throw error;
    }
};

export { type Page } from 'patchright';
