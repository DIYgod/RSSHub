import type { CheerioAPI } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

export async function fetchDataItemCached(link: string, processor: (articleContent: string) => DataItem): Promise<DataItem> {
    const page = await cache.tryGet<string>(`yystv:article:${link}`, () => ofetch(link));
    return processor(page);
}

export function getArticleList($: CheerioAPI): Array<DataItem & { link: string }> {
    return $('.articles-item')
        .toArray()
        .map((element) => {
            const item = $(element);
            const articleDate = item.find('.article-meta-item').last().text().trim();
            return {
                title: item.find('.articles-title').text(),
                link: new URL(item.find('.articles-link').attr('href')!, 'https://www.yystv.cn').href,
                author: item.find('.article-meta .flex-1').text(),
                description: item.find('.article-brief').text(),
                pubDate: /^\d{4}-\d{2}-\d{2}$/.test(articleDate) ? parseDate(`${articleDate}T00:00:00Z`) : articleDate ? parseRelativeDate(articleDate) : undefined,
            };
        });
}
