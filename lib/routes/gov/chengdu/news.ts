import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage, type Page } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.chengdu.gov.cn';
const link = `${baseUrl}/cdsrmzf/c169603/list.shtml`;

interface NewsItem {
    title: string;
    url: string;
    publishedTimeStr: string;
}

export const route: Route = {
    path: '/news',
    example: '/gov/chengdu/news',
    name: '政务要闻 - 市委市政府',
    categories: ['government'],
    maintainers: ['DIYgod'],
    features: { requirePuppeteer: true },
    radar: [{ source: ['www.chengdu.gov.cn/cdsrmzf/c169603/list.shtml'], target: '/news' }],
    handler,
};

function getItem(item: DataItem, page: Page) {
    return cache.tryGet(item.link!, async () => {
        await page.goto(item.link!, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.detail_content');
        const response = await page.content();
        const $ = load(response);
        const content = $('.detail_content');
        content.find('script, style, button').remove();
        const date = $('meta[name="PubDate"]').attr('content');
        return {
            ...item,
            title: $('meta[name="ArticleTitle"]').attr('content') || item.title,
            description: content.html(),
            pubDate: date ? timezone(parseDate(date), 8) : item.pubDate,
            author: $('meta[name="ContentSource"]').attr('content'),
        };
    });
}

async function handler(ctx) {
    const { page, destroy } = await getPlaywrightPage(link, {
        closeTimeout: 0,
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (['document', 'script'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
        },
    });
    try {
        await page.waitForSelector('.publicList li a');
        const response = await page.content();
        const $ = load(response);
        const channelId = $('meta[name="channelId"]').attr('content');
        if (!channelId) {
            throw new Error('The news column no longer exposes its channel ID.');
        }
        const apiUrl = new URL(`/es-search/search/${channelId}`, baseUrl);
        apiUrl.search = new URLSearchParams({ _template: 'ucap/cdtf', _pageSize: '20', SORTED_TIME: 'DESC', IS_STICKY: 'DESC', SEQ_NUM: 'DESC', page: '1' }).toString();
        await page.goto(apiUrl.href, { waitUntil: 'domcontentloaded' });
        await page.locator('body').filter({ hasText: '"results":' }).waitFor();
        const apiText = await page.locator('body').textContent();
        const apiResponse: { results: NewsItem[] } = JSON.parse(apiText!);
        if (!Array.isArray(apiResponse.results)) {
            throw new TypeError('The news API no longer returns an article list.');
        }
        const requestedLimit = Number.parseInt(ctx.req.query('limit') ?? '');
        const items = apiResponse.results
            .slice(0, requestedLimit > 0 ? requestedLimit : 20)
            .map((item): DataItem => ({ title: item.title, link: new URL(item.url, baseUrl).href, pubDate: timezone(parseDate(item.publishedTimeStr), 8) }));
        return { title: '成都市人民政府 - 政务要闻', link, language: 'zh-CN' as const, item: await pMap(items, (item) => getItem(item, page), { concurrency: 1 }) };
    } finally {
        await destroy();
    }
}
