import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const url = 'https://seugs.seu.edu.cn/26671/list.htm';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/seu/yjs',
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
            source: ['seugs.seu.edu.cn/26671/list.htm', 'seugs.seu.edu.cn/'],
        },
    ],
    name: '研究生院全部公告',
    maintainers: ['Denkiyohou'],
    handler,
    url: 'seugs.seu.edu.cn/26671/list.htm',
};

async function handler() {
    const response = await got(url);
    const $ = load(response.data);
    const list = $('.news')
        .toArray()
        .map((element): DataItem => {
            const info = {
                title: $(element).find('span.news_title > a').attr('title')!,
                link: `https://seugs.seu.edu.cn${$(element).find('span.news_title > a').attr('href')}`,
                pubDate: $(element).find('span.news_meta').text() ? parseDate(`${$(element).find('span.news_meta').text()}T00:00:00+08:00`) : undefined,
            };
            return info;
        });

    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(item.link!, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                return { description: $('.wp_articlecontent').html() };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: '东南大学研究生公告',
        link: url,
        item: items,
    };
}
