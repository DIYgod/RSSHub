import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.shanghaitech.edu.cn';

export const route: Route = {
    path: '/activity',
    categories: ['university'],
    example: '/shanghaitech/activity',
    radar: [
        {
            source: ['www.shanghaitech.edu.cn/hd/list.htm'],
        },
    ],
    name: '活动通知',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.shanghaitech.edu.cn/hd/list.htm',
};

async function handler(ctx: Context) {
    const link = `${baseUrl}/hd/list.htm`;
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;

    const response = await ofetch(`${baseUrl}/_wp3services/generalQuery?queryObj=articles`, {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/javascript, */*; q=0.01',
            Referer: link,
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: new URLSearchParams({
            siteId: '8',
            columnId: '15079',
            pageIndex: '1',
            rows: String(limit),
            orders: JSON.stringify([{ field: 'f1', type: 'desc' }]),
            returnInfos: JSON.stringify([
                { field: 'title', name: 'title' },
                { field: 'f2', name: 'f2' },
            ]),
            conditions: JSON.stringify([{ field: 'scope', value: 0, judge: '=' }]),
        }),
        parseResponse: JSON.parse,
    });

    const list = response.data.map((item) => ({
        title: item.title,
        link: item.url.replace(/^http:/, 'https:'),
        author: item.f2,
        pubDate: timezone(parseDate(item.publishTime), 8),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const $ = load(detailResponse);
                $('.mr .news_imgs a.dj').remove();
                item.description = ($('.mr .news_imgs').html() ?? '') + $('div.wp_articlecontent').html();
                return item;
            })
        )
    );

    return {
        title: '上海科技大学 - 活动',
        link,
        item: items,
    };
}
