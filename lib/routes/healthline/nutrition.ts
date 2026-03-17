import { load } from 'cheerio';

import config from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/healthline/nutrition',
    parameters: { category: 'Category, nutrition by default' },
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
            source: ['healthline.com/'],
            target: '/nutrition',
        },
    ],
    name: 'Healthline',
    maintainers: ['maqiu'],
    handler,
    url: 'www.healthline.com',
};

export default handler;

async function handler(ctx) {
    const category = ctx.req.param('category') || 'nutrition';
    const limit = ctx.req.query('limit') || 20;
    const baseUrl = 'https://www.healthline.com';
    const url = `${baseUrl}/${category}`;

    const browser = await puppeteer();
    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const content = await page.content();
    await browser.close();

    const $ = load(content);

    const list = $('a[href*="/' + category + '/"]')
        .filter((_, el) => {
            const href = $(el).attr('href');
            return href && href.match(new RegExp(`/${category}/[a-z0-9-]+$`));
        })
        .toArray()
        .map((el) => {
            const $el = $(el);
            const href = $el.attr('href');
            const title = $el.text().trim();
            return {
                title,
                link: href?.startsWith('http') ? href : `${baseUrl}${href}`,
            };
        })
        .filter((item) => item.title);

    const uniqueList = list.filter((item, index, self) => index === self.findIndex((t) => t.link === item.link));

    const items = await Promise.all(
        uniqueList.slice(0, Number(limit)).map(async (item) => {
            const cached = await cache.tryGet(item.link, async () => {
                try {
                    const articleResponse = await fetch(item.link, {
                        headers: {
                            'User-Agent': config.trueUA,
                        },
                    });
                    const articleHtml = await articleResponse.text();
                    const $article = load(articleHtml);

                    const dateStr = $article('meta[property="article:published_time"]').attr('content') || $article('time').attr('datetime');
                    const pubDate = dateStr ? parseDate(dateStr) : undefined;

                    return {
                        title: item.title,
                        link: item.link,
                        guid: item.link,
                        pubDate,
                    };
                } catch {
                    return {
                        title: item.title,
                        link: item.link,
                        guid: item.link,
                    };
                }
            });
            return cached;
        })
    );

    return {
        title: `Healthline - ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        link: url,
        item: items,
        description: 'Healthline Nutrition articles',
    };
}
