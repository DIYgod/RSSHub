import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

export const route: Route = {
    path: '/user/:id',
    categories: ['picture', 'popular'],
    view: ViewType.Pictures,
    example: '/fantia/user/3498',
    parameters: { id: 'User id, can be found in user profile URL' },
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
            source: ['fantia.jp/fanclubs/:id'],
        },
    ],
    name: 'User Posts',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://fantia.jp';
    const userUrl = `${rootUrl}/api/v1/fanclubs/${ctx.req.param('id')}`;

    const initalResponse = await got({
        method: 'get',
        url: rootUrl,
        headers: {
            Cookie: config.fantia.cookies ?? '',
        },
    });

    const csrfToken = initalResponse.data.match(/name="csrf-token" content="(.*?)"\s?\/>/)[1];

    const response = await got({
        method: 'get',
        url: userUrl,
        headers: {
            Cookie: config.fantia.cookies ?? '',
        },
    });

    const list = response.data.fanclub.recent_posts.map((item) => ({
        title: item.title,
        link: `${rootUrl}/api/v1/posts/${item.id}`,
        description: `<p>${item.comment}</p>`,
        pubDate: parseDate(item.posted_at),
    }));
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const contentResponse = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        Cookie: config.fantia.cookies ?? '',
                        'X-CSRF-Token': csrfToken,
                        Accept: 'application/json, text/plain, */*',
                        Referer: `${rootUrl}/`,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                item.link = item.link.replace('api/v1/', '');
                item.description += `<img src="${contentResponse.data.post?.thumb?.large ?? contentResponse.data.post.thumb_micro}">`;

                return item;
            })
        )
    );

    return {
        title: `Fantia - ${response.data.fanclub.fanclub_name_with_creator_name}`,
        link: `${rootUrl}/fanclubs/${ctx.req.param('id')}`,
        item: items,
    };
}
