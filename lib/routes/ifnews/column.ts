import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:cid',
    categories: ['traditional-media'],
    example: '/ifnews/48',
    parameters: { cid: '栏目 ID' },
    description: '`cid`可在对应栏目的 url 后的参数中获取，如`热点快报`的栏目 url 为`http://www.ifnews.com/column.html?cid=48`, `cid`即为`48`.',
    name: '栏目',
    maintainers: ['Origami404'],
    handler,
};

function getPublishedDate(value: string | undefined) {
    if (!value) {
        return;
    }
    const date = /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/.test(value) ? parseDate(`${value.length === 10 ? `${value}T00:00:00` : value.replace(' ', 'T')}+08:00`) : parseRelativeDate(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

async function handler(ctx: Context) {
    const { cid } = ctx.req.param();
    const url = 'https://www.ifnews.com';
    const columnUrl = new URL('/column.html', url);
    columnUrl.searchParams.set('cid', cid);
    const data = await ofetch('https://api.ifnews.com/api/getArticles', {
        query: { cid },
        headers: {
            Referer: columnUrl.href,
        },
    });

    const list: Array<DataItem & { aid: string }> = data.list.map((item): DataItem & { aid: string } => ({
        title: item.title,
        author: item.createUser,
        link: `${url}/news.html?${new URLSearchParams({ aid: String(item.fileID) })}`,
        pubDate: getPublishedDate(item.publishTime),
        aid: item.fileID,
    }));

    const result = await pMap(
        list,
        async (item) => {
            const description = await cache.tryGet(item.link!, async () => {
                const content = await ofetch('https://api.ifnews.com/api/getArticle', {
                    query: { aid: item.aid },
                    headers: { Referer: item.link! },
                });
                return content.content;
            });
            const metadata: DataItem & { aid?: string } = { ...item };
            delete metadata.aid;
            return { ...metadata, description };
        },
        { concurrency: 3 }
    );

    return {
        title: `人民日报社 国际金融报 ${data.column.columnName}`,
        description: data.column.description || data.column.keyword,
        link: columnUrl.href,
        item: result,
    };
}
