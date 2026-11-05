import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

interface SourceArticle {
    article_info: {
        article_id: number;
        title: string;
        create_at: string;
    };
    author?: { profile?: { name?: string } };
    cate?: { name?: string };
}

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/pencilnews',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '文章列表',
    maintainers: ['defp'],
    handler,
    description: '获取铅笔道最新文章',
};

async function handler() {
    const baseUrl = 'https://www.pencilnews.cn';
    const apiUrl = 'https://api.pencilnews.cn/articles';

    const response = await got(apiUrl, {
        searchParams: {
            page: 0,
            page_size: 20,
        },
    });

    const articles: SourceArticle[] = response.data.data.articles;

    const items = await pMap(
        articles,
        (article) => {
            const info = article.article_info;
            const articleId = info.article_id;
            const link = `${baseUrl}/p/${articleId}.html`;

            return cache.tryGet(link, async () => {
                const detailResponse = await got(link);
                const $ = load(detailResponse.data);
                const content = $('.article_content').html();

                return {
                    title: info.title,
                    description: content,
                    link,
                    author: article.author?.profile?.name || '',
                    pubDate: parseDateInTimezone(info.create_at, 8),
                    category: article.cate?.name ? [article.cate.name] : [],
                    guid: String(articleId),
                };
            });
        },
        { concurrency: 3 }
    );

    return {
        title: '铅笔道',
        link: baseUrl,
        item: items,
    };
}
