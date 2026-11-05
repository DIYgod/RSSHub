import type { Context } from 'hono';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/article/:id?',
    categories: ['new-media'],
    example: '/ssydt/article',
    parameters: { id: 'id，见下表，默认为推荐' },
    description: `| 推荐 | 时事日报 | 时事专题 | 备考技巧 | 招考信息 | 时事月报 | 重要会议 | 领导讲话 | 时事周刊 | 官网公告 | 时事评论 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 0    | 3        | 6        | 13       | 12       | 4        | 10       | 11       | 5        | 8        | 7        |`,
    name: '资讯',
    maintainers: ['nczitzk'],
    handler,
};

const titles = new Map([
    ['0', '推荐'],
    ['3', '时事日报'],
    ['6', '时事专题'],
    ['13', '备考技巧'],
    ['12', '招考信息'],
    ['4', '时事月报'],
    ['10', '重要会议'],
    ['11', '领导讲话'],
    ['5', '时事周刊'],
    ['8', '官网公告'],
    ['7', '时事评论'],
]);

async function handler(ctx: Context) {
    const { id = '' } = ctx.req.param();

    const rootUrl = 'https://www.ssydt.com';
    const currentUrl = `${rootUrl}/api/article/articles?product=ssydt&terminal=Browser&pageSize=20&articleTypeId=${id}`;
    const response = await ofetch(currentUrl);

    const list: Array<DataItem & { link: string }> = response.results.map((item) => ({
        guid: String(item.id),
        title: item.title,
        category: item.typeName ? [item.typeName] : undefined,
        link: `${rootUrl}/article/${item.id}`,
        pubDate: item.gmtCreate ? timezone(parseDate(item.gmtCreate), 8) : undefined,
    }));

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`ssydt:article:detail:v3:${item.link}`, async () => {
                const detailResponse = await ofetch<ArticleDetailResponse>(`${rootUrl}/api/article/webArticles/${item.guid}`);
                const description = detailResponse.results?.ssArticleArticleText?.content;
                if (!description) {
                    throw new NotFoundError(`Article ${item.guid} has no public content in the official detail response.`);
                }
                return { description };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: `${titles.get(id || '0')} - 时事一点通`,
        link: `${rootUrl}/article?type=${id}`,
        item: items,
    };
}

interface ArticleDetailResponse {
    results?: {
        ssArticleArticleText?: { content?: string };
    };
}
