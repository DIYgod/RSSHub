import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { compareDates, parseDate } from '@/utils/time';

const host = 'https://www.ymgal.games';
const types = {
    news: '?type=NEWS&page=1',
    column: '?type=COLUMN&page=1',
};
async function fetchDescription(itemUrl: string): Promise<Pick<DataItem, 'description'>> {
    const result = await got(itemUrl);
    const $ = load(result.data);
    return { description: $('article').html()?.trim() };
}
export const route: Route = {
    path: '/article/:type?',
    categories: ['anime'],
    example: '/ymgal/article',
    parameters: { type: '文章类型' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '文章',
    maintainers: ['SunBK201'],
    handler,
    description: `| 全部文章 | 资讯 | 专栏   |
| -------- | ---- | ------ |
| all      | news | column |`,
};
async function handler(ctx) {
    const type = ctx.req.param('type') || 'all';
    if (type !== 'all' && !Object.hasOwn(types, type)) {
        throw new InvalidParameterError('Invalid article type: use all, news, or column');
    }
    const link = `${host}/co/topic/list` + types[type];
    let data: any[];
    if (type === 'all') {
        const lists = await pMap(
            Object.values(types),
            async (type) => {
                const response = await got(`${host}/co/topic/list${type}`);
                return response.data.data;
            },
            { concurrency: 3, stopOnError: false }
        );
        data = lists
            .flat()
            .toSorted((a, b) => compareDates(parseDate(b.publishTime, 8), parseDate(a.publishTime, 8)))
            .slice(0, 10);
    } else {
        const response = await got(link);
        data = response.data.data;
    }
    const items = await pMap(
        data,
        async (item) => {
            const itemUrl = host + '/co/article/' + item.topicId;
            const details = await cache.tryGet<Pick<DataItem, 'description'>>(`ymgal:article:${itemUrl}`, () => fetchDescription(itemUrl));
            return {
                title: item.title,
                link: itemUrl,
                author: item.createAt,
                category: [item.topicCategory],
                pubDate: parseDate(item.publishTime, 8),
                description: details.description,
            };
        },
        { concurrency: 3, stopOnError: false }
    );
    let info = '全部文章';
    if (type === 'news') {
        info = '资讯';
    } else if (type === 'column') {
        info = '专栏';
    }
    return {
        title: `月幕 Galgame - ${info}`,
        link: `${host}/co/article`,
        description: `月幕 Galgame - ${info}`,
        item: items,
    };
}
