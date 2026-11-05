import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const apiBaseUrl = 'https://api-we.foodtalks.cn';
export const baseUrl = 'https://www.foodtalks.cn';

export const parseList = (records): DataItem[] =>
    records.map((item) => {
        const pubDate = item.publishTime ? timezone(parseDate(item.publishTime), 8) : undefined;
        return {
            title: item.title,
            pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
            link: `${baseUrl}/news/${item.id}`,
            category: [item.parentTagCode === 'category' ? item.tagCode : item.parentTagCode, ...item.seoKeywords.split(',')].filter(Boolean),
            author: item.author || item.sourceName,
            id: String(item.id),
            image: item.coverImg,
        };
    });

export const processItems = (list: DataItem[], ctx: Context) => {
    const limit = getRouteLimit(ctx, 15);
    const nativeOrder = ctx.req.query('sorted') === 'false';
    const allDated = list.every((item) => item.pubDate instanceof Date && Number.isFinite(item.pubDate.getTime()));
    if (!nativeOrder && allDated) {
        list = list.toSorted((a, b) => +new Date(b.pubDate!) - +new Date(a.pubDate!));
    }
    if (nativeOrder || allDated) {
        list = list.slice(0, limit);
    }
    return pMap(
        list,
        async (item): Promise<DataItem> => {
            const description = await cache.tryGet(`foodtalks:article-body:${item.link}`, async () => {
                const response = await ofetch(`${apiBaseUrl}/news/news/${item.id}?language=ZH`, {
                    headers: {
                        referer: `${baseUrl}/`,
                    },
                });
                return response.data.content;
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );
};
