import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getPlaywrightPage, type Page } from '@/utils/playwright';

export const route: Route = {
    path: '/release-notes/:id',
    categories: ['program-update'],
    example: '/qnap/release-notes/qts',
    parameters: { id: 'OS id, see below' },
    name: 'Release Notes',
    maintainers: ['nczitzk'],
    description: `| QTS | QuTS hero  | QuTScloud | QSS | QuWAN Orchestrator  | QES | QVP | QuRouter | TAS | AfoBot |
| --- | ---------- | --------- | --- | ------------------- | --- | --- | -------- | --- | ------ |
| qts | quts\\_hero | qutscloud | qss | quwan\\_orchestrator | qes | qvp | qurouter | tas | afobot |`,
    handler,
    features: { requirePuppeteer: true },
};

async function browserDocument(page: Page, url: string, selector: string) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector(selector, { timeout: 15000 });
    return page.content();
}

async function handler(ctx: Context) {
    const { id } = ctx.req.param();

    const rootUrl = 'https://www.qnap.com';
    const currentUrl = `${rootUrl}/en/release-notes/${id}`;
    const response = await ofetch.raw(currentUrl, { responseType: 'text', ignoreResponseError: true });
    let browser: Awaited<ReturnType<typeof getPlaywrightPage>> | undefined;
    try {
        let document = response._data ?? '';
        if ((response.status === 202 || response.status === 403) && document.includes('AwsWafIntegration')) {
            browser = await getPlaywrightPage(currentUrl, {
                noGoto: true,
                closeTimeout: 0,
                onBeforeLoad: async (page) => {
                    await page.route('**/*', (request) => {
                        const { hostname } = new URL(request.request().url());
                        const allowedHost = hostname === 'www.qnap.com' || hostname.endsWith('.awswaf.com');
                        return allowedHost && ['document', 'script', 'fetch', 'xhr'].includes(request.request().resourceType()) ? request.continue() : request.abort();
                    });
                },
            });
            document = await browserDocument(browser.page, currentUrl, '.release-notes-content__versions li');
        } else if (!response.ok) {
            throw new Error(`QNAP release notes returned HTTP ${response.status}: ${currentUrl}`);
        }

        const $ = load(document);
        const list: Array<DataItem & { link: string }> = $('.release-notes-content__versions li')
            .slice(0, 20)
            .toArray()
            .flatMap((item) => {
                const $item = $(item);
                const href = $item.find('.version-btn-container a').attr('href');
                if (!href) {
                    return [];
                }
                return {
                    title: $item.find('.version-title h4').text(),
                    link: new URL(href, currentUrl).href,
                    pubDate: parseDateInTimezone($item.find('.release-note-time').text(), 0),
                };
            });

        const items = await pMap(
            list,
            (item) =>
                cache.tryGet(item.link, async () => {
                    const detailResponse = browser ? await browserDocument(browser.page, item.link, '.release-notes-content__intro .content') : await ofetch(item.link);
                    const content = load(detailResponse);
                    item.description = content('.release-notes-content__intro .content').html()!;
                    return item;
                }),
            { concurrency: browser ? 1 : 3 }
        );

        return { title: $('head title').text(), link: currentUrl, language: 'en', item: items } satisfies Data;
    } finally {
        if (browser) {
            await browser.page.close();
            await browser.destroy();
        }
    }
}
