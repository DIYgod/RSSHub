import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/user/:id',
    categories: ['other'],
    example: '/grand-challenge/user/Isensee',
    parameters: {
        id: '用户 ID，必选，用户页面网址里面的用户 ID',
    },
    name: '用户参加的 Challenge',
    maintainers: ['WhoIsSure'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const link = `https://grand-challenge.org/users/${id}/`;
    const response = await ofetch(link);

    const $ = load(response);

    return {
        title: `${id}'s participations`,
        link,
        item: $('.card')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const itemPicUrl = $item.find('img').attr('src');
                const description = $item.find('.card-text').text() || 'No description';
                return {
                    title: $item.find('h5').text(),
                    description: `${description}<br><img src="${itemPicUrl}">`,
                    link: $item.find('.stretched-link').attr('href'),
                };
            }),
    };
}
