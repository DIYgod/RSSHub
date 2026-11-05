import { load } from 'cheerio';
import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/profile/:type/:username',
    categories: ['bbs'],
    example: '/lowendtalk/profile/discussions/Ikoula',
    parameters: {
        type: {
            description: 'Content type',
            options: [
                { value: 'discussions', label: 'Discussions' },
                { value: 'comments', label: 'Comments' },
            ],
        },
        username: 'Username, can be found in the profile URL',
    },
    features: {
        requireConfig: [
            {
                name: 'LOWENDTALK_COOKIE',
                description: 'The `Cookie` header of a logged-in session. Profile pages are only visible to signed-in users.',
            },
        ],
    },
    radar: [
        {
            source: ['lowendtalk.com/profile/:type/:username'],
        },
    ],
    name: 'User Discussions / Comments',
    maintainers: ['TonyRL'],
    handler,
    url: 'lowendtalk.com',
};

async function handler(ctx: Context) {
    const { type, username } = ctx.req.param();
    if (!config.lowendtalk.cookie) {
        throw new ConfigNotFoundError('LowEndTalk RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const baseUrl = 'https://lowendtalk.com';
    const link = `${baseUrl}/profile/${type}/${username}`;
    const response = await ofetch(link, { headers: { cookie: config.lowendtalk.cookie } });
    const $ = load(response);

    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;
    const items = await Promise.all(
        $('.DataList > .Item')
            .toArray()
            .slice(0, limit)
            .map((element) => {
                const $item = $(element);
                const a = $item.find(type === 'discussions' ? '.Title a' : '.Meta b a');
                const link = a.attr('href')!.replace(/#.*/, '');
                return cache.tryGet(link, async () => {
                    const response = await ofetch(link);
                    const $ = load(response);
                    const $post = $(`#${$item.attr('id')}`);
                    return {
                        title: a.text(),
                        link,
                        description: $post.find('.Message').html(),
                        author: username,
                        category: $post.find('.Category a').text() || undefined,
                        pubDate: timezone(parseDate($post.find('time').attr('datetime')!), 0),
                    };
                });
            })
    );

    return {
        title: $('head title').text(),
        link,
        image: new URL($('.ProfilePhotoLarge').attr('src')!, baseUrl).href,
        item: items,
    };
}
