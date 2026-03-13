import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { parseItem, parseList } from './utils';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['game'],
    example: '/4gamers/tag/限時免費',
    parameters: { tag: '标签名，可在标签 URL 中找到' },
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
            source: ['www.4gamers.com.tw/news/tag/:tag'],
        },
    ],
    name: '标签',
    maintainers: ['hoilc'],
    handler,
    url: 'www.4gamers.com.tw/news',
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25;

    const { data: response } = await got(`https://www.4gamers.com.tw/site/api/news/by-tag`, {
        searchParams: {
            tag,
            pageSize: limit,
        },
    });
    const list = parseList(response.data.results);

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseItem(item))));

    return {
        title: `4Gamers - #${tag}`,
        link: `https://www.4gamers.com.tw/news/tag/${tag}`,
        item: items,
    };
}
