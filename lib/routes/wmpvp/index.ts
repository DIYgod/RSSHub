import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const parsePublicationDate = (value: string | number | undefined, format?: string) => {
    if (typeof value !== 'number' && !value) {
        return;
    }
    const date = parseDate(value, format);
    return Number.isFinite(date.getTime()) ? date : undefined;
};
export const route: Route = {
    path: '/news/:type',
    categories: ['game'],
    example: '/wmpvp/news/1',
    parameters: { type: '资讯分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '资讯列表',
    maintainers: ['tssujt'],
    handler,
    description: `| DOTA2 | CS2 |
| ----- | --- |
| 1     | 2   |`,
};
interface News {
    newsId: string | number;
    title: string;
    publishTime: string | number;
    author: string;
    tagDTOList?: Array<{
        name: string;
    }>;
    thumbnail?: string;
}
const TYPE_MAP = {
    '1': 'DOTA2',
    '2': 'CS2',
};
async function handler(ctx) {
    const type = ctx.req.param('type');
    if (!Object.hasOwn(TYPE_MAP, type)) {
        throw new InvalidParameterError('Invalid news category. Use 1 for DOTA2 or 2 for CS2.');
    }
    const response = await got({
        method: 'get',
        url: `https://appengine.wmpvp.com/steamcn/community/homepage/getHomeInformation?gameTypeStr=${type}&pageNum=1&pageSize=20`,
    });
    const data: Array<{
        news: News;
    }> = response.data.result.filter((item) => !isNullish(item.news));
    const items = await unwrapFirstFailure(
        pMap(
            data,
            async (item) => {
                const entity = item.news;
                const newsId = entity.newsId;
                const newsLink = `https://news.wmpvp.com/news.html?id=${newsId}&gameTypeStr=${type}`;
                const detail = await cache.tryGet(`wmpvp:detail:v2:${newsLink}`, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: `https://appactivity.wmpvp.com/steamcn/app/news/getAppNewsById?gameType=${type}&newsId=${newsId}`,
                    });
                    return {
                        description: detailResponse.data.result.news.content,
                    };
                });
                return {
                    title: entity.title,
                    pubDate: parsePublicationDate(entity.publishTime),
                    link: newsLink,
                    guid: newsLink,
                    author: entity.author,
                    category: entity.tagDTOList?.map((tag) => tag.name),
                    image: entity.thumbnail,
                    description: detail.description,
                };
            },
            { concurrency: 3, stopOnError: false }
        )
    );
    return {
        title: `完美世界电竞 - ${TYPE_MAP[type]} 资讯`,
        link: 'https://news.wmpvp.com/',
        item: items,
    };
}
async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}
function isNullish(value: unknown): value is null | undefined {
    return isOneOf(value, [null, undefined]);
}

function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
