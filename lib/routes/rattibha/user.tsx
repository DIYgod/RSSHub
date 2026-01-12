import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
        description: renderToString(
            <>
                {item.thread.m ? (
                    <>
                        {item.thread.m.type === 1 ? (
                            <video controls preload="metadata" poster={item.thread.m.picture_url}>
                                <source src={item.thread.m.video_url} type="video/mp4" />
                            </video>
                        ) : item.thread.m.type === 2 ? (
                            <img src={item.thread.m.picture_url} />
                        ) : null}
                        <br />
                    </>
                ) : null}
                {raw(item.thread.t.info.text.replaceAll('\n', '<br>'))}
            </>
        ),
    }));

    return {
        title: `سلاسل تغريدات ${twitterUser}`,
        link: `${baseUrl}/${twitterUser}`,
        item: items,
    };
}
