import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category',
    categories: ['blog'],
    example: '/gwern/newest',
    parameters: { category: '網誌主頁的分類訊息' },
    name: '博客',
    maintainers: ['cerebrater'],
    handler,
};

const baseURL = 'https://gwern.net';

async function handler(ctx: Context) {
    const { category } = ctx.req.param();
    const name = category.charAt(0).toUpperCase() + category.slice(1);
    const url = `${baseURL}/index`;
    const res = await ofetch(url);
    const $ = load(res);

    const out = await Promise.all(
        $(`section#${category} ul > li`)
            .toArray()
            .map((item) => {
                const link = baseURL + $(item).find('a').attr('href');

                return cache.tryGet(link, async () => {
                    const res = await ofetch(link);
                    const $$ = load(res);

                    const time = $$('span#page-creation').text();

                    $$('a').removeAttr('data-popup-title').removeAttr('data-popup-title-html').removeAttr('data-popup-author').removeAttr('data-popup-abstract').removeAttr('data-popup-doi').removeAttr('data-popup-date');

                    return {
                        title: $$('header > h1').text(),
                        author: 'Gwern Branwen',
                        description: $$('div#markdownBody').html()!.replace('&shy;', ''),
                        link,
                        guid: link,
                        pubDate: parseDate(time),
                    };
                });
            })
    );

    return {
        title: `Gwern - ${name}`,
        link: url,
        item: out,
    };
}
