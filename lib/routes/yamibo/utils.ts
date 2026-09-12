import type { Cheerio } from 'cheerio';
import type { Element } from 'domhandler';

import { config } from '@/config';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import type { getPlaywrightPage as createPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

export const bbsOrigin = 'https://bbs.yamibo.com';

export function getDate(date: string): Date {
    return timezone(parseDate(date), 8);
}

type ThreadOptions = { ordertype?: string };
type ThreadData = { link: string; data: string };
type BrowserPage = Awaited<ReturnType<typeof createPlaywrightPage>>;

const allowedResources = new Set(['document', 'script', 'xhr', 'fetch']);

// A feed may fetch many articles, but only one browser page is needed.
export class ThreadFetcher {
    private browser: Promise<BrowserPage> | undefined;
    private pending: Promise<unknown> = Promise.resolve();
    private closed = false;

    private async openBrowser(link: string) {
        const { getPlaywrightPage } = await import('@/utils/playwright');
        const browser = await getPlaywrightPage(link, { noGoto: true, closeTimeout: 0 });
        try {
            const { auth, salt } = config.yamibo;
            if (auth && salt) {
                await browser.context.addCookies([
                    { name: 'EeqY_2132_saltkey', value: salt, url: bbsOrigin },
                    { name: 'EeqY_2132_auth', value: auth, url: bbsOrigin },
                ]);
            }
            await browser.page.route('**/*', (route) => (allowedResources.has(route.request().resourceType()) ? route.continue() : route.abort()));
            return browser;
        } catch (error) {
            await browser.destroy();
            throw error;
        }
    }

    private fetchBrowser(link: string): Promise<string> {
        const result = this.readBrowser(this.pending, link);
        this.pending = result;
        return result;
    }

    private async readBrowser(previous: Promise<unknown>, link: string): Promise<string> {
        try {
            await previous;
        } catch {
            // The previous article's caller receives its own error.
        }
        if (this.closed) {
            throw new Error('yamibo: the browser session has already closed');
        }
        this.browser ??= this.openBrowser(link);
        const { page } = await this.browser;
        await page.goto(link, { waitUntil: 'domcontentloaded' });
        try {
            await page.waitForSelector('#postlist', { state: 'attached', timeout: 10000 });
        } catch {
            throw new Error('yamibo: browser access did not return thread content. Check that the thread is accessible and YAMIBO_AUTH and YAMIBO_SALT are valid.');
        }
        return page.content();
    }

    async fetchThread(tid: string, options?: ThreadOptions): Promise<ThreadData> {
        const params = new URLSearchParams({ mod: 'viewthread', tid });
        if (options?.ordertype) {
            params.set('ordertype', options.ordertype);
        }
        const link = `${bbsOrigin}/forum.php?${params}`;
        const { auth, salt } = config.yamibo;
        const headers: HeadersInit = {};
        if (auth && salt) {
            headers.cookie = `EeqY_2132_saltkey=${salt}; EeqY_2132_auth=${auth}`;
        }
        const data = await ofetch<string>(link, { headers });
        return {
            link,
            data: data.startsWith('<script type="text/javascript">') ? await this.fetchBrowser(link) : data,
        };
    }

    async close() {
        this.closed = true;
        try {
            await this.pending;
        } catch {
            // Article failures have already been reported to their callers.
        }
        if (this.browser) {
            let browser: BrowserPage;
            try {
                browser = await this.browser;
            } catch {
                // openBrowser cleans up failed initialization before rejecting.
                return;
            }
            await browser.destroy();
        }
    }
}

export async function fetchThread(tid: string, options?: ThreadOptions): Promise<ThreadData> {
    const fetcher = new ThreadFetcher();
    try {
        return await fetcher.fetchThread(tid, options);
    } finally {
        await fetcher.close();
    }
}

export function generateDescription($item: Cheerio<Element>, postId: string) {
    const content = $item.find(`#postmessage_${postId}`).parent();
    content.find('img').each((_, img) => {
        const src = img.attribs.zoomfile ?? img.attribs.src;
        img.attribs.src = `${bbsOrigin}/${src}`;
    });
    let description = content.html() ?? '';

    const images = $item.find('.pattl img').toArray();
    for (const img of images) {
        const src = img.attribs.zoomfile ?? img.attribs.src;
        description += `<img src="${bbsOrigin}/${src}" />`;
    }

    return description;
}
