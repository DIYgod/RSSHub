import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/news/:category?',
    categories: ['game'],
    example: '/loltw/news',
    parameters: { category: '新闻分类，置空为全部新闻' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '台服新闻',
    maintainers: ['hoilc'],
    handler,
    description: `| 活动  | 资讯 | 系统   | 电竞   | 版本资讯 | 战棋资讯 |
| ----- | ---- | ------ | ------ | -------- | -------- |
| event | info | system | esport | patch    | TFTpatch |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    const baseUrl = 'https://lol.garena.tw';

    const response = await got(`${baseUrl}/api/news/search?category=${category}`);

    const list = response.data.data.news.map((item) => ({
        guid: item.id,
        title: item.title,
        author: 'Garena',
        link: `${baseUrl}/news/articles/${item.id}`,
        pubDate: parseDate(item.updated_at * 1000),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(`${baseUrl}/api/news/detail?news_id=${item.guid}`);
                item.description = art(path.join(__dirname, 'templates/news.art'), detailResponse.data.data.news_detail);
                return item;
            })
        )
    );

    return {
        title: '英雄联盟 - 台服新闻',
        link: category ? `${baseUrl}/news/${category}` : `${baseUrl}/news`,
        item: items,
    };
}
