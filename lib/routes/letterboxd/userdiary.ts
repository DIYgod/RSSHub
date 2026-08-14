import type { Context } from 'hono';

import type { Route } from '@/types';

import { getData } from './utils';

export const route: Route = {
    path: '/user/diary/:username',
    categories: ['new-media'],
    example: '/letterboxd/user/diary/demiadejuyigbe',
    parameters: {
        username: 'username',
    },
    name: 'User diary',
    maintainers: ['loganrockmore'],
    handler,
};

async function handler(ctx: Context) {
    const { username } = ctx.req.param();
    const title = `Letterboxd - diary - ${username}`;

    return await getData(username, title);
}
