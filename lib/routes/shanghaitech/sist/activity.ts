import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://sist.shanghaitech.edu.cn';

export const route: Route = {
    path: '/sist/activity',
    categories: ['university'],
    example: '/shanghaitech/sist/activity',
    radar: [
        {
            source: ['sist.shanghaitech.edu.cn/xyhd/list.htm'],
        },
    ],
    name: '信息科技与技术学院活动',
    maintainers: ['HenryQW'],
    handler,
    url: 'sist.shanghaitech.edu.cn/xyhd/list.htm',
};

async function handler(ctx: Context) {
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;

    const response = await ofetch(`${baseUrl}/_wp3services/generalQuery?queryObj=articles`, {
        method: 'POST',
        headers: {
            Referer: `${baseUrl}/xyhd/list.htm`,
        },
        body: new URLSearchParams({
            siteId: '43',
            columnId: '10969',
            pageIndex: '1',
            rows: String(limit),
            orders: JSON.stringify([{ field: 'publishTime', type: 'desc' }]),
            returnInfos: JSON.stringify([
                { field: 'title', name: 'title' },
                { field: 'summary', name: 'summary' },
                { field: 'publishTime', pattern: [{ name: 'd', value: 'yyyy-MM-dd' }], name: 'publishTime' },
            ]),
            conditions: JSON.stringify([{ field: 'scope', value: 1, judge: '=' }]),
        }),
        parseResponse: JSON.parse,
    });

    const list = response.data.map((item) => ({
        title: item.title,
        link: item.url.replace(/^http:\/\//, 'https://'),
        author: item.publisher,
        pubDate: timezone(parseDate(item.publishTime), 8),
        description: item.summary,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (new URL(item.link).hostname !== 'sist.shanghaitech.edu.cn') {
                    return item;
                }
                const detailResponse = await ofetch(item.link);
                const $ = load(detailResponse);
                item.description = $('.wp_articlecontent').html();
                return item;
            })
        )
    );

    return {
        title: '上海科技大学信息科技与技术学院 -- 活动',
        link: `${baseUrl}/xyhd/list.htm`,
        item: items,
    };
}
