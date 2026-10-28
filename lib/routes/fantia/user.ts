import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/:id',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/fantia/user/3498',
    parameters: { id: 'User id, can be found in user profile URL' },
    features: {
        requireConfig: [
            {
                name: 'FANTIA_COOKIE',
                optional: true,
                description: 'The `cookie` after login can be obtained by viewing the request header in the console, If not filled in will cause some posts that require login to read to get exceptions',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['fantia.jp/fanclubs/:id'],
        },
    ],
    name: 'User Posts',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const rootUrl = 'https://fantia.jp';
    const userUrl = `${rootUrl}/api/v1/fanclubs/${ctx.req.param('id')}`;

    const initalResponse = await ofetch(rootUrl, {
        headers: {
            Cookie: config.fantia.cookies ?? '',
        },
    });

    const csrfToken = load(initalResponse)('meta[name="csrf-token"]').attr('content');
    if (!csrfToken) {
        throw new Error('Fantia did not provide the CSRF token required by its post API. Check that the homepage is accessible and that the configured cookie is valid.');
    }

    const response = await ofetch(userUrl, {
        headers: {
            Cookie: config.fantia.cookies ?? '',
        },
    });

    const fanClub = response.fanclub;

    const list: Array<{ title: string; link: string; description: string; pubDate: Date }> = response.fanclub.recent_posts.map((item) => ({
        title: item.title,
        link: `${rootUrl}/api/v1/posts/${item.id}`,
        description: item.comment ? `<p>${item.comment}</p>` : '',
        pubDate: parseDate(item.posted_at),
    }));
    const items = await pMap(
        list,
        async (item) => {
            const preview = await cache.tryGet(`${item.link}#preview`, async () => {
                const contentResponse = await ofetch(item.link, {
                    headers: {
                        Cookie: config.fantia.cookies ?? '',
                        'X-CSRF-Token': csrfToken,
                        Accept: 'application/json, text/plain, */*',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                const image = contentResponse.post?.thumb?.original ?? contentResponse.post?.thumb_micro;
                return image ? `<img src="${image}">` : '';
            });
            return {
                ...item,
                link: item.link.replace('api/v1/', ''),
                description: item.description + preview,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `Fantia - ${fanClub.fanclub_name_with_creator_name}`,
        description: fanClub.comment?.replaceAll('\r\n', ' ')?.trim(),
        link: `${rootUrl}/fanclubs/${ctx.req.param('id')}`,
        image: fanClub.icon.original ?? fanClub.icon.main,
        item: items,
    };
}
