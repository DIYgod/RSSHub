import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/news',
    categories: ['forecast'],
    example: '/bmkg/news',
    parameters: {},
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
            source: ['bmkg.go.id/', 'bmkg.go.id/berita'],
        },
    ],
    name: 'News',
    maintainers: ['Shinanory'],
    handler,
    url: 'bmkg.go.id/',
};

async function handler() {
    const url = 'https://www.bmkg.go.id';
    const response = await got(url);
    const $ = load(response.data);
    const list = $('div .ms-slide')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            const img = item.find('img');

            return {
                title: a.text(),
                link: `${url}/${a.attr('href')}`,
                itunes_item_image: img.attr('data-src'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                const p = $('div .blog-grid').find('p');
                item.description = p.text();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: url,
        description: '印尼气象气候和地球物理局 新闻 | BMKG news',
        item: items,
        language: 'in',
    };
}
