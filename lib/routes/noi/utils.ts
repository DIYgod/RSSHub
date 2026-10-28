import { load } from 'cheerio';

import ofetch from '@/utils/ofetch';
import { getPlaywrightPage } from '@/utils/playwright';

const isTlsError = (error: unknown): error is Error => {
    if (!(error instanceof Error)) {
        return false;
    }
    return /CERT_|ERR_TLS|TLS handshake|secure TLS connection/i.test(error.message) || (error.cause !== undefined && isTlsError(error.cause));
};

export const createPageFetcher = () => {
    let session: ReturnType<typeof getPlaywrightPage> | undefined;
    let pending: Promise<void> = Promise.resolve();

    return {
        getPage: async (url: string, selector: string) => {
            try {
                const response = await ofetch(url, { responseType: 'text' });
                const $ = load(response);
                if ($(selector).length) {
                    return $;
                }
                if (!$('meta[name="aliyun_waf_aa"], meta[name="aliyun_waf_bb"]').length) {
                    throw new Error(`NOI returned no ${selector} content at ${url}.`);
                }
            } catch (error) {
                if (!isTlsError(error)) {
                    throw error;
                }
            }

            const task = (async () => {
                await pending;
                session ??= getPlaywrightPage('about:blank', {
                    noGoto: true,
                    closeTimeout: 0,
                    onBeforeLoad: async (page) => {
                        await page.route('**/*', (route) => (route.request().resourceType() === 'document' ? route.continue() : route.abort()));
                    },
                });
                const { page } = await session;
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await page.waitForSelector(selector, { timeout: 30000 });
                const html = await page.content();
                return load(html);
            })();
            pending = settleRequest(task);
            return task;
        },
        destroy: async () => {
            await pending;
            if (session) {
                await (await session).destroy();
            }
        },
    };
};

async function settleRequest(promise: Promise<unknown>): Promise<void> {
    try {
        await promise;
    } catch {
        // Keep queue scheduling alive; the caller still receives the original request rejection.
    }
}
