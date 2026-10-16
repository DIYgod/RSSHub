import { FetchError } from 'ofetch';

import ofetch from '@/utils/ofetch';
import { getPlaywrightPage } from '@/utils/playwright';

async function settleQueueRequest(request: Promise<unknown>): Promise<void> {
    try {
        await request;
    } catch {
        // The original request retains its rejection; only the serial queue is released.
        return;
    }
}

function isNoResponseTimeout(error: unknown): error is FetchError {
    if (!(error instanceof FetchError) || error.response) {
        return false;
    }
    let cause: unknown = error.cause;
    while (cause instanceof Error) {
        if (cause.name === 'TimeoutError' || ('code' in cause && cause.code === 'UND_ERR_CONNECT_TIMEOUT')) {
            return true;
        }
        cause = cause.cause;
    }
    return false;
}

export class ContentFetcher {
    private browserPromise?: ReturnType<typeof getPlaywrightPage>;
    private browserQueue: Promise<void> = Promise.resolve();
    private pending = new Set<Promise<ArrayBuffer | string>>();

    private async removeSettledRequest(request: Promise<ArrayBuffer | string>) {
        try {
            await request;
        } catch {
            // The original request reports the error to its caller.
            return;
        } finally {
            this.pending.delete(request);
        }
    }

    private async fetchBrowser(url: string) {
        await this.browserQueue;
        this.browserPromise ??= getPlaywrightPage('about:blank', {
            noGoto: true,
            closeTimeout: 0,
            onBeforeLoad: async (page) => {
                await page.route('**/*', (route) => (['document'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
            },
        });
        const { page } = await this.browserPromise;
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        if (!response || !response.ok()) {
            throw new Error(`The source returned HTTP ${response?.status() ?? 'no response'} for ${url}.`);
        }
        return await page.content();
    }

    private async fetchRequest(url: string): Promise<ArrayBuffer | string> {
        try {
            return await ofetch(url, { responseType: 'arrayBuffer' });
        } catch (error) {
            if (!isNoResponseTimeout(error)) {
                throw error;
            }
        }
        const request = this.fetchBrowser(url);
        this.browserQueue = settleQueueRequest(request);
        return request;
    }

    fetch(url: string) {
        const request = this.fetchRequest(url);
        this.pending.add(request);
        void this.removeSettledRequest(request);
        return request;
    }

    async destroy() {
        await Promise.allSettled(this.pending);
        await this.browserQueue;
        let browser: Awaited<ReturnType<typeof getPlaywrightPage>> | undefined;
        try {
            browser = await this.browserPromise;
        } catch {
            // A failed browser acquisition has no browser resource to destroy.
            return;
        }
        if (browser) {
            await browser.destroy();
        }
    }
}
