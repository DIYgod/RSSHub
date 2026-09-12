import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

async function handler(ctx: Context) {
    const { cid } = ctx.req.param();
    const url = 'https://www.ifnews.com';
    const data = await ofetch(`https://api.ifnews.com/api/getArticles?cid=${cid}`, {
        headers: {
            Referer: `${url}/column.html?cid=${cid}`,
        },
    });

    const list = data.list.map((item): DataItem & { aid: string } => ({
        title: item.title,
        author: item.createUser,
        link: `${url}/news.html?aid=${item.fileID}`,
        pubDate: timezone(parseRelativeDate(item.publishTime), 8),
        aid: item.fileID,
    }));

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const content = await ofetch(`https://api.ifnews.com/api/getArticle?aid=${item.aid}`, {
                    headers: {
                        Referer: item.link!,
                    },
                });

                item.description = content.content;

                return item;
            })
        )
    );

    return {
        title: `人民日报社 国际金融报 ${data.column.columnName}`,
        description: data.column.description || data.column.keyword,
        link: `${url}/column.html?cid=${cid}`,
        item: result,
    };
}
