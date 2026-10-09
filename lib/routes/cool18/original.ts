import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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

function getItem(item: DataItem) {
    return cache.tryGet(item.link!, async () => {
        const response = await ofetch(item.link!);
        const $ = load(response);
        item.description = $('pre').html()?.replaceAll('<font color="#E6E6DD">cool18.com</font>', '');
        return item;
    });
}

async function handler(ctx) {
    const response = await ofetch(link);
    const $ = load(response);
    const items = $('#d_list a[href*="act=threadview"]')
        .slice(0, Number(ctx.req.query('limit')) || 20)
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
    const item = await pMap(items, getItem, { concurrency: 3 });
    return { title: 'Cool18 - 热门泛原创', link, language: 'zh-CN' as const, item };
}
