import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const apiUrl = 'https://wufazhuce.com/';
const NAME = '「ONE · 一个」';

export const route: Route = {
    path: '/one',
    categories: ['new-media'],
    example: '/wufazhuce/one',
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
            source: ['wufazhuce.com'],
            target: '/one',
        },
    ],
    name: NAME,
    maintainers: ['sicheng1806'],
    handler,
};

async function handler(): Promise<Data> {
    const resp = await got(apiUrl);
    const $ = load(resp.body);
    let items: DataItem[] = [
        ...$('#carousel-one div.item')
            .toArray()
            .map((item) => {
                const a = $(item).find('.fp-one-cita a').first();
                return {
                    title: a.text(),
                    link: a.attr('href'),
                    description: '',
                    category: '摄影',
                };
            }),
        ...$('.fp-one-articulo a')
            .toArray()
            .map((item) => {
                const a = $(item);
                return {
                    title: a.text(),
                    link: a.attr('href'),
                    description: '',
                    category: '文章',
                };
            }),
        ...$('.fp-one-cuestion a')
            .toArray()
            .map((item) => {
                const a = $(item);
                return {
                    title: a.text(),
                    link: a.attr('href'),
                    description: '',
                    category: '问题',
                };
            }),
    ];

    // 添加全文
    items = await Promise.all(
        items.map((item: DataItem) =>
            cache.tryGet(item.link, async () => {
                const rsp = await got(item.link);
                const content = load(rsp.body);
                item.description = content('.tab-content').html() || '';
                return item;
            })
        )
    );

    // 生成rss
    return {
        title: NAME,
        link: apiUrl,
        item: items,
        description: '复杂世界里, 一个就够了. One is all.',
    };
}
