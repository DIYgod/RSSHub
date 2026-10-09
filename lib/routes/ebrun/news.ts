import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage, type Page } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.ebrun.com';

export const route: Route = {
    path: '/news/:section?',
    example: '/ebrun/news/information',
    name: '最新资讯和快讯',
    categories: ['new-media'],
    maintainers: ['DIYgod'],
    features: { requirePuppeteer: true },
    parameters: { section: 'information：最新资讯（默认）；newest：快讯。' },
    radar: [
        { source: ['www.ebrun.com/information'], target: '/news/information' },
        { source: ['www.ebrun.com/newest'], target: '/news/newest' },
    ],
    handler,
};

function getItem(item: DataItem, page: Page) {
    return cache.tryGet(item.link!, async () => {
        await page.goto(item.link!, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.post-text-title');
        const response = await page.content();
        const $ = load(response);
        const content = $('.post-text');
        content.find('script, style, button, .ad-content').remove();
        content.find('img[data-src]').each((_, element) => {
            const image = $(element);
            image.attr('src', new URL(image.attr('data-src')!, item.link).href);
        });
        item.description = content.html() || '';
        const date = $('.post-header .date-time').text();
        if (date) {
            item.pubDate = timezone(parseDate(date, 'YYYY-MM-DD HH:mm'), 8);
        }
        const author = $('.post-header .source .info span').first().text();
        if (author) {
            item.author = author.replace(/^作者[：:]\s*/, '');
        }
        item.category = $('.article-label a')
            .toArray()
            .map((element) => $(element).text());
        return item;
    });
}

async function handler(ctx) {
    const section = ctx.req.param('section') ?? 'information';
    if (!['information', 'newest'].includes(section)) {
        throw new InvalidParameterError('Choose information or newest.');
    }
    const link = `${baseUrl}/${section}/`;
    const selector = section === 'information' ? '.news-item .title a' : '#quick-list .quick-list__item-title a';
    const { page, destroy } = await getPlaywrightPage(link, {
        closeTimeout: 0,
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (route.request().resourceType() === 'document' ? route.continue() : route.abort()));
        },
    });
    try {
        await page.waitForSelector(selector);
        const response = await page.content();
        const $ = load(response);
        const requestedLimit = Number.parseInt(ctx.req.query('limit') ?? '');
        const items = $(selector)
            .toArray()
            .slice(0, requestedLimit > 0 ? requestedLimit : 20)
            .map((element): DataItem => ({ title: $(element).text(), link: new URL($(element).attr('href')!, baseUrl).href }));
        return { title: `亿邦动力 - ${section === 'information' ? '最新资讯' : '快讯'}`, link, language: 'zh-CN' as const, item: await pMap(items, (item) => getItem(item, page), { concurrency: 1 }) };
    } finally {
        await destroy();
    }
}
