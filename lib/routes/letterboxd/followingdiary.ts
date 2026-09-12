import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { getData } from './utils';

export const route: Route = {
    path: '/user/followingdiary/:username',
    categories: ['new-media'],
    example: '/letterboxd/user/followingdiary/demiadejuyigbe',
    parameters: {
        username: 'username',
    },
    name: 'Following diary',
    maintainers: ['loganrockmore'],
    handler,
};

async function handler(ctx: Context) {
    const { username } = ctx.req.param();
    const url = `https://letterboxd.com/${username}/following/`;
    const title = `Letterboxd - following diary - ${username}`;

    const html = await ofetch(url, {
        headers: {
            Referer: url,
        },
    });
    const $ = load(html);

    const users = $('.person-summary .title-3 a')
        .toArray()
        .map((user) => $(user).attr('href')!);

    const usersResult = await Promise.all(users.map((user) => getData(user.replaceAll('/', ''), title)));

    return {
        title,
        link: url,
        description: $('meta[name="description"]').attr('content'),
        item: usersResult.flatMap((result) => result.item),
    };
}
