import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { getArticle } from './article';

const link = 'https://www.cool18.com/indexorgposts.php';

export const route: Route = {
    path: '/original',
    example: '/cool18/original',
    name: '热门泛原创',
    categories: ['bbs'],
    maintainers: ['DIYgod'],
    features: { nsfw: true },
    radar: [{ source: ['cool18.com/indexorgposts.php'], target: '/original' }],
    handler,
};

async function handler(ctx) {
    const response = await ofetch(link);
    const $ = load(response);
    const limit = getRouteLimit(ctx, 20);
    const items = $('#d_list a[href*="act=threadview"]')
        .slice(0, ctx.req.query('sorted') === 'false' ? limit : Math.max(20, limit))
        .toArray()
        .map((element) => {
            const article = $(element);
            return {
                title: article.text(),
                link: new URL(article.attr('href')!, link).href,
                author: article.nextAll('a').first().text(),
                category: [article.prev('a').text()],
                pubDate: parseDate(article.nextAll('i').first().text(), 'MM/DD/YY'),
            };
        });
    const item = await pMap(items, getArticle, { concurrency: 3 });
    return { title: 'Cool18 - 热门泛原创', link, language: 'zh-CN' as const, item: item.filter((item): item is DataItem => item !== undefined) };
}
