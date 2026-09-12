// Worker-compatible Playwright with ordinary remote WebSocket and Browser Run support.
import { launch } from '@cloudflare/playwright';
import type { Browser, Page } from 'patchright';

import { config } from '@/config';

import logger from './logger';
import { connectRemotePlaywright } from './playwright-remote.worker';

export { setPlaywrightServiceBinding } from './playwright-remote.worker';

type GotoOptions = Parameters<Page['goto']>[1];
let browserBinding: any;

export const setBrowserBinding = (binding: any) => {
    browserBinding = binding;
};

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
        browser = (await launch(browserBinding, { keep_alive: 60000 })) as unknown as Browser;
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
