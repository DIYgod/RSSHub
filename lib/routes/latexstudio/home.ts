import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/home',
    categories: ['blog'],
    example: '/latexstudio/home',
    name: '首页',
    maintainers: ['kt286', 'nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.latexstudio.net/articles/';

    const response = await ofetch(rootUrl);
    const $ = load(response);

    const list = $('div.article-list')
        .find('h3.article-title')
        .toArray()
        .slice(0, 20)
        .map((item): DataItem & { link: string } => {
            const a = $(item).find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, rootUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await ofetch(item.link);
                const content = load(res);

                item.pubDate = timezone(parseDate(content('div.entry-meta ul li').eq(3).text().replace('发布日期：', '')), 8);
                item.description = content('div.article-text').html();

                return item;
            })
        )
    );

    return {
        title: 'LaTeX 开源小屋',
        link: rootUrl,
        item: items,
    };
}
