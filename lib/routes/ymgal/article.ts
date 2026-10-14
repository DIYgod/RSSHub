import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.ymgal.games';
const types = {
    news: '?type=NEWS&page=1',
    column: '?type=COLUMN&page=1',
};
function getPublicationTimestamp(value: unknown): number {
    if (typeof value === 'number' || (typeof value === 'string' && value.trim())) {
        return parseDate(value).getTime();
    }
    return NaN;
}
function getPublicationDate(value: unknown): Date | undefined {
    const timestamp = getPublicationTimestamp(value);
    if (Number.isFinite(timestamp)) {
        return timezone(parseDate(timestamp), 8);
    }
    return;
}
async function fetchDescription(itemUrl: string): Promise<Pick<DataItem, 'description'>> {
    const result = await got(itemUrl);
    const $ = load(result.data);
    const description = $('article').html();
    if (!description?.trim()) {
        throw new Error(`Unable to find main article content: ${itemUrl}`);
    }
    return { description: description.trim() };
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
    let data: any[] = [];
    if (type === 'all') {
        await pMap(
            Object.values(types),
            async (type) => {
                const response = await got(`${host}/co/topic/list${type}`);
                data.push(...response.data.data);
            },
            { concurrency: 3, stopOnError: false }
        );
        data = data.toSorted((a, b) => getPublicationTimestamp(b.publishTime) - getPublicationTimestamp(a.publishTime)).slice(0, 10);
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
                author: typeof item.createAt === 'string' && item.createAt.trim() ? item.createAt : undefined,
                category: typeof item.topicCategory === 'string' && item.topicCategory.trim() ? [item.topicCategory] : undefined,
                pubDate: getPublicationDate(item.publishTime),
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
