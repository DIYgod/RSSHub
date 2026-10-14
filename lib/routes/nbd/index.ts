import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

async function settleQueueRequest(request: Promise<unknown>): Promise<void> {
    try {
        await request;
    } catch {
        // The original request retains its rejection; only the serial queue is released.
        return;
    }
}

const isClosedConnection = (error: unknown) => {
    const visited = new Set<object>();
    let cause = error;
    while (cause && typeof cause === 'object' && !visited.has(cause)) {
        visited.add(cause);
        if ('code' in cause && cause.code === 'UND_ERR_SOCKET') {
            return true;
        }
        cause = 'cause' in cause ? cause.cause : undefined;
    }
    return false;
};

class ArticleSource {
    private browser?: ReturnType<typeof getPlaywrightPage>;
    private queue: Promise<void> = Promise.resolve();

    private async getBrowserBody(url: string) {
        await this.queue;
        this.browser ??= getPlaywrightPage(url, {
            closeTimeout: 0,
            noGoto: true,
            javaScriptEnabled: false,
            onBeforeLoad: async (page) => {
                await page.route('**/*', (request) => (['document'].includes(request.request().resourceType()) ? request.continue() : request.abort()));
            },
        });
        const { page } = await this.browser;
        let response;
        try {
            response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (error) {
            if (!(error instanceof Error) || !error.message.includes('net::ERR_EMPTY_RESPONSE')) {
                throw error;
            }
            response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        }
        if (!response || response.status() >= 400) {
            throw new Error(`The article page returned HTTP ${response?.status() ?? 'no response'}: ${url}`);
        }
        await page.locator('.g-articl-text').waitFor({ state: 'attached', timeout: 10000 });
        return { html: await page.content(), url: page.url() };
    }

    async getBody(url: string) {
        try {
            const response = await ofetch.raw(url, { responseType: 'text' });
            return { html: response._data ?? '', url: response.url };
        } catch (error) {
            if (!isClosedConnection(error)) {
                throw error;
            }
        }

        const request = this.getBrowserBody(url);
        this.queue = settleQueueRequest(request);
        return request;
    }

    async close() {
        await this.queue;
        let browser: Awaited<ReturnType<typeof getPlaywrightPage>> | undefined;
        try {
            browser = await this.browser;
        } catch {
            // A failed browser acquisition has no browser resource to destroy.
            return;
        }
        if (browser) {
            await browser.destroy();
        }
    }
}

export const route: Route = {
    path: '/:id?',
    categories: ['finance'],
    example: '/nbd',
    parameters: { id: '分类 id，见下表，默认为要闻' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['nbd.com.cn/', 'nbd.com.cn/columns/:id?'],
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    url: 'nbd.com.cn/',
    description: `| 头条 | 要闻 | 图片新闻 | 推荐 |
| ---- | ---- | -------- | ---- |
| 2    | 3    | 4        | 5    |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '3';

    const rootUrl = 'https://www.nbd.com.cn';
    const currentUrl = `${rootUrl}/columns/${id}/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.u-news-title a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: $item.attr('href'),
            };
        });

    const source = new ArticleSource();
    const pendingRequests: Array<Promise<DataItem>> = [];
    try {
        const items = await pMap(
            list,
            (item) => {
                const pending = (async () => {
                    const detail = await cache.tryGet(`nbd:article:v3:${item.link}`, async () => {
                        const detailResponse = await source.getBody(item.link!);
                        if (!detailResponse.url.startsWith(`${rootUrl}/`)) {
                            return {};
                        }
                        const detailBody = detailResponse.html;
                        const content = load(detailBody);
                        const publishedAt = detailBody.match(/"pubDate": "(.*)"/)?.[1];

                        return {
                            description: content('.g-articl-text').html(),
                            pubDate: publishedAt ? (/Z$|[+-]\d{2}:\d{2}$/.test(publishedAt) ? parseDate(publishedAt) : timezone(parseDate(publishedAt), 8)) : undefined,
                        };
                    });
                    return { ...item, ...detail };
                })();
                pendingRequests.push(pending);
                return pending;
            },
            { concurrency: 3 }
        );

        return {
            title: `${$('h1').text() || $('.u-channelname').text()} - 每经网`,
            link: currentUrl,
            item: items,
        };
    } finally {
        await Promise.allSettled(pendingRequests);
        await source.close();
    }
}
