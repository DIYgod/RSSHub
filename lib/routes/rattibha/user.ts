import path from 'node:path';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { getCurrentPath } from '@/utils/helpers';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

const __dirname = getCurrentPath(import.meta.url);

export const route: Route = {
    path: '/user/:user',
    categories: ['social-media'],
    example: '/rattibha/user/elonmusk',
    parameters: { user: 'Twitter username, without @' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['rattibha.com/:user'],
        },
    ],
    name: 'User Threads',
    maintainers: ['yshalsager'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://rattibha.com';
    const { user: twitterUser } = ctx.req.param();

    const userData = await cache.tryGet(`rattibha:user:${twitterUser}`, async () => {
        const data = await ofetch(`${baseUrl}/user`, {
            query: { id: twitterUser },
        });
        return data.user;
    });

    const userThreads = await cache.tryGet(
        `rattibha:userThreads:${twitterUser}`,
        () =>
            ofetch(`${baseUrl}/u_threads`, {
                query: {
                    id: userData.account_user_id,
                    page: 0,
                    post_type: 0,
                },
            }),
        config.cache.routeExpire,
        false
    );

    // extract the relevant data from the API response
    const items = userThreads.map((item) => ({
        title: item.thread.t.info.text.split('\n')[0],
        link: `${baseUrl}/thread/${item.thread_id}`,
        pubDate: parseDate(item.thread.created_at),
        updated: parseDate(item.thread.updated_at),
        author: userData.name,
        category: item.thread.categories.map((category) => category.tag.name),
        description: art(path.join(__dirname, 'templates/description.art'), {
            text: item.thread.t.info.text.replaceAll('\n', '<br>'),
            media: item.thread.m,
        }),
    }));

    return {
        title: `سلاسل تغريدات ${twitterUser}`,
        link: `${baseUrl}/${twitterUser}`,
        item: items,
    };
}
