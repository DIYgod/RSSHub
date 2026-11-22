import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

export const apiBaseUrl = 'https://api-we.foodtalks.cn';
export const baseUrl = 'https://www.foodtalks.cn';

export const parseList = (records): DataItem[] =>
    records.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.publishTime, 8),
        link: `${baseUrl}/news/${item.id}`,
        category: [item.parentTagCode === 'category' ? item.tagCode : item.parentTagCode, ...item.seoKeywords.split(',')].filter(Boolean),
        author: item.author || item.sourceName,
        id: String(item.id),
        image: item.coverImg,
    }));

export const processItems = (list: DataItem[], ctx: Context) =>
    pMap(
        list.slice(0, getRouteLimit(ctx, 15)),
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
