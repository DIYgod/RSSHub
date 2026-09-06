import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const apiBaseUrl = 'https://api-we.foodtalks.cn';
export const baseUrl = 'https://www.foodtalks.cn';

export const parseList = (records): DataItem[] =>
    records.map((item) => ({
        title: item.title,
        pubDate: timezone(parseDate(item.publishTime), 8),
        link: `${baseUrl}/news/${item.id}`,
        category: [item.parentTagCode === 'category' ? item.tagCode : item.parentTagCode, ...item.seoKeywords.split(',')].filter(Boolean),
        author: item.author || item.sourceName,
        id: item.id,
        image: item.coverImg,
    }));

export const processItems = (list: DataItem[]) =>
    Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(`${apiBaseUrl}/news/news/${item.id}?language=ZH`, {
                    headers: {
                        referer: `${baseUrl}/`,
                    },
                });
                item.description = response.data.content;
                return item;
            })
        )
    );
