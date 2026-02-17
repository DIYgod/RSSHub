import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:category?',
    categories: ['government'],
    example: '/whitehouse/news',
    parameters: { category: 'Category, see below, all by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['whitehouse.gov/:category', 'whitehouse.gov/'],
            target: '/news/:category',
        },
    ],
    name: 'News',
    maintainers: ['nczitzk', 'hkamran80'],
    handler,
    description: `| All | Articles | Briefings and Statements | Presidential Actions | Remarks |
| --- | -------- | ------------------------ | -------------------- | ------- |
|     | articles | briefings-statements     | presidential-actions | remarks |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'news';

    const rootUrl = 'https://www.whitehouse.gov';
    const currentUrl = `${rootUrl}/${category}/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.post')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a').first();
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(item.find('time').attr('datetime')),
                category: [item.find('a[rel^=tag]').first().text()],
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });
                const $ = load(response.data);

                $('.wp-block-whitehouse-topper').remove();
                item.description = $('.entry-content').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
