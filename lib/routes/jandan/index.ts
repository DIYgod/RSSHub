import { Route, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    example: '/jandan',
    name: 'Feed',
    maintainers: ['nczitzk', 'bigfei', 'pseudoyu'],
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
            target: '/jandan',
        },
    ],
    handler,
};

async function handler(): Promise<{
    title: string;
    link: string;
    item: DataItem[];
}> {
    const rootUrl = 'http://i.jandan.net';
    const feed = await parser.parseURL(`${rootUrl}/feed/`);
    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link || '', async () => {
                if (!item.link) {
                    return undefined as unknown as DataItem;
                }
                const response = await ofetch(item.link);
                const $ = load(response);
                $('.wechat-hide').prev().nextAll().remove();
                $('img').replaceWith((i, e) => {
                    const src = $(e).attr('src');
                    const alt = $(e).attr('alt');
                    const newSrc = src?.replace(/https?:\/\/(\w+)\.moyu\.im/, 'https://$1.sinaimg.cn');
                    return `<img src="${newSrc}" alt="${alt}">`;
                });
                const single: DataItem = {
                    title: item.title || '',
                    description: $('.entry').html() || '',
                    pubDate: item.pubDate,
                    link: item.link,
                    author: item['dc:creator'],
                    category: item.categories,
                };
                return single;
            })
        )
    ).then((items) => items.filter((item): item is DataItem => item !== undefined));

    return {
        title: '煎蛋',
        link: rootUrl,
        item: items,
    };
}
