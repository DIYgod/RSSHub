import { load } from 'cheerio';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import puppeteer from '@/utils/puppeteer';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/showcase/:category?',
    categories: ['traditional-media'],
    example: '/farsnews/showcase',
    parameters: { category: 'Category slug from farsnews.ir/showcase URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [{
        source: ['farsnews.ir/showcase'],
        target: '/showcase/:category',
    }],
    name: 'Showcase',
    maintainers: [],
    handler,
    description: `Fars News showcase articles. Persian news agency.`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';
    const baseUrl = 'https://farsnews.ir';
    const currentUrl = category ? `${baseUrl}/showcase/${category}` : `${baseUrl}/showcase`;

    const browser = await puppeteer();
    const page = await browser.newPage();

    await page.goto(currentUrl, {
        waitUntil: 'domcontentloaded',
    });

    const response = await page.content();
    await page.close();
    await browser.close();

    const $ = load(response);

    const items = $('.rounded-2xl.border.border-gray-200')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a[href^="/"]').first();
            const href = a.attr('href');

            return {
                title: a.find('h2').text().trim() || a.text().trim(),
                link: href ? (href.startsWith('http') ? href : `${baseUrl}${href}`) : undefined,
            };
        })
        .filter((item) => item.title && item.link)
        .slice(0, 5);

    const processedItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({ method: 'get', url: item.link });
                    const detail$ = load(detailResponse.data);

                    const desc = detail$('meta[name="description"]').attr('content') || '';
                    item.description = desc.length > 50 ? desc.substring(0, 1000) : desc;

                    const timeText = detail$('time').attr('datetime') || detail$('.text-gray-400').first().text();
                    if (timeText) {
                        item.pubDate = parseDate(timeText);
                    }
                } catch (e) {
                    // Silently continue if detail fetch fails
                }
                return item;
            })
        )
    );

    return {
        title: 'Fars News - Showcase',
        link: currentUrl,
        item: processedItems,
    };
}
