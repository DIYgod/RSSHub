import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

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
    const section = $('section').filter((_, element) => $(element).attr('id') === category);
    if (!section.length) {
        throw new InvalidParameterError('Unknown Gwern category. Choose a section ID from https://gwern.net/index, such as newest.');
    }

    const out = await pMap(
        section.find('ul > li').toArray(),
        (item) => {
            const link = new URL($(item).find('a').attr('href')!, url).href;

            return cache.tryGet(link, async () => {
                const res = await ofetch(link);
                const $$ = load(res);

                const time = $$('meta[name="dc.date.issued"]').attr('content');

                return {
                    title: $$('header > h1').text(),
                    author: 'Gwern Branwen',
                    description: $$('div#markdownBody').html()!.replace('&shy;', ''),
                    link,
                    guid: link,
                    pubDate: parseDate(`${time}T00:00:00Z`),
                };
            });
        },
        { concurrency: 3 }
    );

    return {
        title: `Gwern - ${name}`,
        link: url,
        item: out,
    };
}
