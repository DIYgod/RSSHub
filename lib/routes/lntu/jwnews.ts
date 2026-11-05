import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/jwnews',
    categories: ['university'],
    example: '/lntu/jwnews',
    name: '教务公告',
    maintainers: ['ikvarxt'],
    handler,
};

async function handler() {
    const link = 'https://jwzx.lntu.edu.cn/index/jwgg.htm';
    const response = await ofetch(link);
    const $ = load(response);

    const items = await pMap(
        $('.list3 li').toArray(),
        async (item) => {
            const itemLink = new URL($('a', item).attr('href')!, link).href;

            const date = $(item).find('p.date').text();
            const article = await cache.tryGet(itemLink, async () => {
                const result = await ofetch(itemLink);
                const $article = load(result);

                $article('img, div, span, p, table, td, tr').removeAttr('style');
                $article('style').remove();

                return {
                    title: $article('meta[name="pageTitle"]').attr('content') || $('a', item).attr('title') || $article('title').text(),
                    description: $article('.v_news_content')
                        .html()!
                        .replaceAll(/(<span[^>]*>|<\/span>)/g, ''),
                    link: itemLink,
                    author: '辽宁工程技术大学教务处',
                };
            });
            return {
                ...article,
                pubDate: date ? parseDateInTimezone(date, 8) : undefined,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: '辽宁工程技术大学教务公告',
        link,
        item: items,
    };
}
