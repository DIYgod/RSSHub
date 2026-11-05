import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id',
    categories: ['social-media'],
    example: '/icity/sai',
    parameters: { id: '用户 id' },
    name: '用户动态',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const rootUrl = `https://icity.ly/u/${id}`;
    const response = await ofetch(rootUrl);

    const $ = load(response);
    const items = $('li.diary')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const published = $item.find('time.hours').attr('datetime');
            return {
                link: new URL($item.find('a.timeago').attr('href')!, 'https://icity.ly').href,
                title: $item.prevAll('li.day-cut').first().text(),
                description: $item.find('div.line').html(),
                pubDate: published ? parseDate(published) : undefined,
            };
        });

    return {
        title: $('title').text(),
        link: rootUrl,
        item: items,
        description: $('div.bio').text(),
    };
}
