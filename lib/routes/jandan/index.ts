import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    example: '/jandan',
    name: 'Feed',
    maintainers: ['lonelykid', 'nczitzk', 'bigfei', 'pseudoyu'],
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
            source: ['i.jandan.net'],
            target: '/',
        },
    ],
    handler,
};

async function handler(): Promise<{
    title: string;
    link: string;
    item: DataItem[];
}> {
    const rootUrl = 'https://i.jandan.net';
    const feed = await parser.parseString(await ofetch<string, 'text'>(`${rootUrl}/feed/`, { responseType: 'text', headers: { 'User-Agent': config.ua } }));
    const items = await pMap(
        feed.items,
        async (item): Promise<DataItem | undefined> => {
            const link = item.link;
            if (!link) {
                return;
            }
            const description = await cache.tryGet(`jandan:rss-article:${link}`, async () => {
                const response = await ofetch(link);
                const $ = load(response);
                $('.wechat-hide').prev().nextAll().remove();
                $('img').replaceWith((i, e) => {
                    const src = $(e).attr('src');
                    const alt = $(e).attr('alt');
                    const newSrc = src?.replace(/https?:\/\/(\w+)\.moyu\.im/, 'https://$1.sinaimg.cn');
                    return `<img src="${newSrc}" alt="${alt}">`;
                });
                return $('.entry').html();
            });
            return {
                title: item.title || '',
                description,
                pubDate: item.pubDate,
                link: item.link,
                author: item['dc:creator'],
                category: item.categories,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: '煎蛋',
        link: rootUrl,
        item: items.filter((item): item is DataItem => item !== undefined),
    };
}
