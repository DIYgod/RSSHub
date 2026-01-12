import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/hex-rays/news',
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
            source: ['hex-rays.com/', 'hex-rays.com/blog'],
        },
    ],
    name: 'Hex-Rays News',
    maintainers: ['hellodword ', 'TonyRL', 'Mas0n'],
    handler,
    url: 'hex-rays.com/',
};

async function handler(/* ctx*/): Promise<Data> {
    const link = 'https://hex-rays.com/blog/';
    const response = await got.get(link);
    const $ = load(response.data);

    const list: DataItem[] = $('.article  ')
        .toArray()
        .map(
            (ele): DataItem => ({
                title: $('h2 > a', ele).text(),
                link: $('h2 > a', ele).attr('href'),
                pubDate: parseDate($('div.by-line > time', ele).attr('datetime')!),
                author: $('div.by-line > a', ele).text(),
            })
        );

    const items: DataItem[] = await Promise.all(
        list.map((item: DataItem) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got.get(item.link);
                const content = load(detailResponse.data);
                item.category = content('.div.topics > a')
                    .toArray()
                    .map((ele) => content(ele).text());
                item.description = content('.post-body').html();
                return item;
            })
        ) as Array<Promise<DataItem>>
    );

    return {
        title: 'Hex-Rays Blog',
        link,
        item: items,
        image: 'https://hex-rays.com/hubfs/Ico-logo.png',
    };
}
