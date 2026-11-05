import { load } from 'cheerio';
import type { Context } from 'hono';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/index/:cateid',
    categories: ['traditional-media'],
    example: '/zsnews/index/35',
    parameters: { cateid: '类别' },
    name: '新闻',
    maintainers: ['laampui'],
    description: `| 35   | 36   | 37   | 38   | 39   |
| ---- | ---- | ---- | ---- | ---- |
| 本地 | 镇区 | 热点 | 社会 | 综合 |`,
    handler,
};
class ArticleUnavailableError extends Error {}
async function handler(ctx: Context) {
    const { cateid = '35' } = ctx.req.param();
    const response = await ofetch<
        Array<{
            title: string;
            url: string;
            tags?: string;
            logo?: string;
            id?: number;
        }>
    >(`http://www.zsnews.cn/api/mobile/getlist.html?cateid=${cateid}`, { responseType: 'json' });
    const items = await pMap(
        response,
        async (item) => {
            const currentItem = { title: item.title, link: item.url, category: item.tags ? [item.tags] : undefined, image: item.logo || undefined, id: item.id === undefined ? undefined : String(item.id) };
            try {
                const details = await cache.tryGet(`zsnews:details:${item.url}`, async () => {
                    const detailResponse = await ofetch(item.url);
                    const $ = load(detailResponse);
                    const article = $('.article-content');
                    if (!article.length) {
                        throw new ArticleUnavailableError('Article content is unavailable; the source may have returned an access or error page.');
                    }
                    const author = article.children('.article-author').find('span').text().replaceAll(/\s+/g, ' ').trim() || undefined;
                    article.children('.article-author').remove();
                    const dateText = $('.article-meta span').first().text().slice(5);
                    const date = dateText.trim() ? parseDate(dateText) : undefined;
                    return {
                        description: article.html(),
                        author,
                        pubDate: date && !Number.isNaN(date.getTime()) ? timezone(date, 8) : undefined,
                    };
                });
                return { ...currentItem, ...details };
            } catch (error) {
                if (!(error instanceof FetchError || error instanceof ArticleUnavailableError)) {
                    throw error;
                }
                return currentItem;
            }
        },
        { concurrency: 3 }
    );
    return {
        title: '中山新闻',
        link: 'https://www.zsnews.cn/',
        item: items,
    };
}
