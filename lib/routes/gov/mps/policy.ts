import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage, type Page } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.mps.gov.cn';
const sections = {
    documents: { column: 'n6557558', name: '政策文件' },
    interpretations: { column: 'n6557563', name: '政策解读' },
};

export const route: Route = {
    path: '/policy/:section?',
    example: '/gov/mps/policy/documents',
    name: '政策文件与解读',
    categories: ['government'],
    maintainers: ['DIYgod'],
    features: { requirePuppeteer: true },
    parameters: { section: 'documents（政策文件，默认）或 interpretations（政策解读）' },
    radar: [
        { source: ['www.mps.gov.cn/n6557558/index.html'], target: '/policy/documents' },
        { source: ['www.mps.gov.cn/n6557563/index.html'], target: '/policy/interpretations' },
    ],
    handler,
};

function getItem(item: DataItem, page: Page) {
    return cache.tryGet(item.link!, async () => {
        await page.goto(item.link!, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#ztdx, #UCAP-CONTENT, .pages_content');
        const response = await page.content();
        const $ = load(response);
        const content = $('#ztdx, #UCAP-CONTENT, .pages_content').first();
        content.find('script, style, .btn, button').remove();
        const date = $('meta[name="PubDate"]').attr('content');
        return {
            ...item,
            title: $('.bTitle').first().text() || $('meta[name="ArticleTitle"]').attr('content') || item.title,
            description: content.html(),
            pubDate: date ? timezone(parseDate(date.replaceAll(/\s+/g, ' ')), 8) : item.pubDate,
            author: $('meta[name="ContentSource"]').attr('content'),
        };
    });
}

async function handler(ctx) {
    const section = ctx.req.param('section') ?? 'documents';
    if (!Object.hasOwn(sections, section)) {
        throw new InvalidParameterError('Choose documents or interpretations.');
    }
    const { column, name } = sections[section as keyof typeof sections];
    const link = `${baseUrl}/${column}/index.html`;
    const { page, destroy } = await getPlaywrightPage(link, {
        closeTimeout: 0,
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (['document', 'script'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
        },
    });
    try {
        await page.waitForSelector('.list li a');
        const response = await page.content();
        const $ = load(response);
        const requestedLimit = Number.parseInt(ctx.req.query('limit') ?? '');
        const items = $('.list li')
            .toArray()
            .slice(0, requestedLimit > 0 ? requestedLimit : 20)
            .map((element): DataItem => {
                const row = $(element);
                const anchor = row.find('a[href]');
                return {
                    title: anchor.text(),
                    link: new URL(anchor.attr('href')!, link).href,
                    pubDate: timezone(parseDate(row.find('span').text(), 'YYYY-MM-DD'), 8),
                };
            });
        return { title: `${name} - 中华人民共和国公安部`, link, language: 'zh-CN' as const, item: await pMap(items, (item) => getItem(item, page), { concurrency: 1 }) };
    } finally {
        await destroy();
    }
}
