import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const pageUrl = 'https://support.bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5';

export const route: Route = {
    path: '/release/5',
    categories: ['program-update'],
    example: '/bluestacks/release/5',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
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
    const res = await ofetch(pageUrl);
    const $ = load(res);

    const list = $('div h3 a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: $item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const res = await ofetch(item.link!);
                const $ = load(res);

                item.description = $('div.article__body').html();
                item.pubDate = parseDate($('div.meta time').attr('datetime')!);

                return item;
            })
        )
    );

    return {
        title: $('.article__title').text().trim(),
        description: $('meta[name=description]').text().trim(),
        link: pageUrl,
        image: $('link[rel="shortcut icon"]').attr('href'),
        item: items,
    };
}
