import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

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

    const items = $('.list3 li')
        .toArray()
        .map((item) => {
            const itemLink = new URL($('a', item).attr('href')!, link).href;

            return cache.tryGet(itemLink, async () => {
                const result = await ofetch(itemLink);
                const $article = load(result);

                $article('img, div, span, p, table, td, tr').removeAttr('style');
                $article('style').remove();

                return {
                    title: $article('title').text().split('-', 1)[0],
                    description: $article('.v_news_content')
                        .html()!
                        .replaceAll(/(<span[^>]*>|<\/span>)/g, ''),
                    link: itemLink,
                    author: '辽宁工程技术大学教务处',
                };
            });
        });

    return {
        title: '辽宁工程技术大学教务公告',
        link,
        item: await Promise.all(items),
    };
}
