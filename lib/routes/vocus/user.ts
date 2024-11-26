import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { processList, ProcessFeed, baseUrl, apiUrl } from './utils';

export const route: Route = {
    path: '/user/:id',
    categories: ['social-media', 'popular'],
    example: '/vocus/user/tsetyan',
    parameters: { id: '用户 id，可在用户主页的 URL 找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户个人文章',
    maintainers: ['LogicJake'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = `${baseUrl}/user/@${id}`;
    const userData = await cache.tryGet(`vocus:user:${id}`, async () => {
        const { data: userData } = await got(`${apiUrl}/api/users/${id}`, {
            headers: {
                referer: link,
            },
        });
        return {
            _id: userData._id,
            fullname: userData.fullname,
            avatarUrl: userData.avatarUrl,
            intro: userData.intro,
        };
    });

    const {
        data: { articles },
    } = await got(`${apiUrl}/api/articles`, {
        headers: {
            referer: link,
        },
        searchParams: {
            userId: userData._id,
        },
    });

    const list = processList(articles);

    const items = await ProcessFeed(list, cache.tryGet);

    return {
        title: `${userData.fullname}｜方格子 vocus`,
        link,
        description: userData.intro,
        image: userData.avatarUrl,
        item: items,
    };
}
