import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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

    const {
        data: { articles },
    } = response.data;

    const items = await Promise.all(
        articles.map((article) => {
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
                    pubDate: parseDate(info.create_at, 'YYYY-MM-DD HH:mm:ss'),
                    category: [],
                    guid: articleId,
                };
            });
        })
    );

    return {
        title: '铅笔道',
        link: baseUrl,
        item: items,
    };
}
