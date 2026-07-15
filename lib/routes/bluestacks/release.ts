import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';

const pageUrl = 'https://support.bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5';

export const route: Route = {
    path: '/release/5',
    categories: ['program-update'],
    example: '/bluestacks/release/5',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5', 'bluestacks.com/'],
        },
    ],
    name: 'BlueStacks 5 Release Notes',
    maintainers: ['TonyRL'],
    handler,
    url: 'bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5',
};

async function handler() {
    const context = await playwright();
    const page = await context.newPage();
    await page.route('**/*', (route) => {
        const request = route.request();
        request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
    });
    await page.goto(pageUrl, {
        waitUntil: 'domcontentloaded',
    });
    const res = await page.evaluate(() => document.documentElement.getHTML());
    await page.close();

    const $ = load(res);

    const list = $('div h3 a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const page = await context.newPage();
                await page.route('**/*', (route) => {
                    const request = route.request();
                    request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
                });
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                const res = await page.evaluate(() => document.documentElement.getHTML());
                const $ = load(res);
                await page.close();

                item.description = $('div.article__body').html();
                item.pubDate = parseDate($('div.meta time').attr('datetime'));

                return item;
            })
        )
    );

    await context.close();

    return {
        title: $('.article__title').text().trim(),
        description: $('meta[name=description]').text().trim(),
        link: pageUrl,
        image: $('link[rel="shortcut icon"]').attr('href'),
        item: items,
    };
}
