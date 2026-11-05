import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getBmkgApiHeaders } from './utils';

interface NewsArticle {
    slug: string;
    date: string;
    title: string;
    author: string;
    content: string;
}

export const route: Route = {
    path: '/news',
    categories: ['forecast'],
    example: '/bmkg/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['bmkg.go.id/', 'bmkg.go.id/berita/utama'],
        },
    ],
    name: 'News',
    maintainers: ['Shinanory'],
    handler,
    url: 'bmkg.go.id/berita/utama',
};

async function handler(): Promise<Data> {
    const url = 'https://www.bmkg.go.id/berita/utama';
    const headers = await getBmkgApiHeaders(url);
    const articles = await ofetch<NewsArticle[]>('https://www.bmkg.go.id/api/content/list-tag/11/12/0', { headers });
    const items = await pMap(
        articles,
        (article) => {
            const link = `${url}/${article.slug}`;
            return cache.tryGet<DataItem>(link, async () => {
                const detail = await ofetch<NewsArticle>(`https://www.bmkg.go.id/api/content/single/${article.slug}`, { headers });
                return {
                    title: detail.title,
                    link,
                    description: detail.content,
                    author: detail.author,
                    pubDate: detail.date ? timezone(parseDate(detail.date, 'YYYY-MM-DD HH:mm:ss'), 7) : undefined,
                };
            });
        },
        { concurrency: 3 }
    );

    return {
        title: 'Berita Utama - BMKG',
        link: url,
        description: '印尼气象气候和地球物理局 新闻 | BMKG news',
        item: items,
        language: 'id',
    };
}
