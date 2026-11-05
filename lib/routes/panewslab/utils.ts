import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const apiBaseUrl = 'https://universal-api.panewslab.com';
export const rootUrl = 'https://www.panewslab.com';
export const apiHeaders = { 'PA-Accept-Language': 'zh' };

export interface Article {
    id: string;
    type: string;
    title: string;
    desc: string;
    content?: string;
    publishedAt: string;
    updatedAt: string;
    cover: string | null;
    author: { profile: { name: string } | null } | null;
    columns: Array<{ column: { name: string } }>;
    tags?: Array<{ tag: { name: string } }>;
}

export const getArticles = (query: Record<string, string | number | boolean>) => ofetch<Article[]>(`${apiBaseUrl}/articles`, { headers: apiHeaders, query: { ...query, skip: 0 } });

export const processArticles = (articles: Article[], fetchDetails = true): Promise<DataItem[]> =>
    pMap(
        articles,
        async (article) => {
            const details = fetchDetails
                ? await cache.tryGet(`panewslab:article:body:${article.id}`, async () => {
                      const response = await ofetch<Article>(`${apiBaseUrl}/articles/${article.id}`, { headers: apiHeaders });
                      return { description: response.content, category: response.tags?.map((item) => item.tag.name) };
                  })
                : { description: article.desc, category: article.tags?.map((item) => item.tag.name) };
            return {
                ...details,
                title: article.title,
                author: article.columns.map((item) => item.column.name).join(', ') || article.author?.profile?.name,
                pubDate: parseDate(article.publishedAt),
                updated: parseDate(article.updatedAt),
                link: `${rootUrl}/zh/articles/${article.id}`,
                image: article.cover ?? undefined,
            };
        },
        { concurrency: 3 }
    );

export const getLimit = (value: string | undefined, defaultValue: number) => {
    const limit = Number(value ?? defaultValue);
    return Number.isFinite(limit) && limit >= 1 ? Math.floor(limit) : defaultValue;
};
