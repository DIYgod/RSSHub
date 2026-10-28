import { load } from 'cheerio';
import type { Context } from 'hono';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
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
    name: '信息科学与技术学院活动',
    maintainers: ['HenryQW'],
    handler,
    url: 'sist.shanghaitech.edu.cn/xyhd/list.htm',
};

async function handler(ctx: Context) {
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isSafeInteger(Math.floor(requestedLimit)) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 20;

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

    const list: Array<DataItem & { link: string }> = response.data.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.url.replace(/^http:\/\//, 'https://'),
        author: item.publisher,
        pubDate: timezone(parseDate(item.publishTime), 8),
        description: item.summary,
    }));

    const items = await pMap(
        list,
        async (item) => {
            const host = new URL(item.link).hostname;
            if (host !== 'sist.shanghaitech.edu.cn' && host !== 'mp.weixin.qq.com') {
                return item;
            }
            try {
                const detail = await cache.tryGet(item.link, async () => {
                    const detailResponse = await ofetch(item.link);
                    const $ = load(detailResponse);
                    if (host === 'mp.weixin.qq.com') {
                        const content = $('#js_content');
                        content.find('img[data-src]').each((_, image) => {
                            $(image).attr('src', $(image).attr('data-src')).removeAttr('data-src');
                        });
                        const timestamp = /\bcreate_timestamp:\s*['"](\d+)['"]\s*\*\s*1/.exec(detailResponse)?.[1];
                        return content.length
                            ? {
                                  description: content.html(),
                                  ...(timestamp && { pubDate: parseDate(Number(timestamp) * 1000) }),
                              }
                            : {};
                    }
                    return { description: $('.wp_articlecontent').html() };
                });
                return { ...item, ...detail };
            } catch (error) {
                if (host === 'mp.weixin.qq.com' && error instanceof FetchError) {
                    return item;
                }
                throw error;
            }
        },
        { concurrency: 3 }
    );

    return {
        title: '上海科技大学信息科学与技术学院 -- 活动',
        link: `${baseUrl}/xyhd/list.htm`,
        item: items,
    };
}
