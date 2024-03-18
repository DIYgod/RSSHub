import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import util from './utils';

export const route: Route = {
    path: '/posts/:id',
    categories: ['programming'],
    example: '/juejin/posts/3051900006845944',
    parameters: { id: '用户 id, 可在用户页 URL 中找到' },
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
            source: ['juejin.cn/user/:id', 'juejin.cn/user/:id/posts'],
        },
    ],
    name: '用户文章',
    maintainers: ['Maecenas'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const response = await got({
        method: 'post',
        url: 'https://api.juejin.cn/content_api/v1/article/query_list',
        json: {
            user_id: id,
            sort_type: 2,
        },
    });
    const { data } = response.data;
    const username = data[0] && data[0].author_user_info && data[0].author_user_info.user_name;
    const resultItems = await util.ProcessFeed(data, cache);

    return {
        title: `掘金专栏-${username}`,
        link: `https://juejin.cn/user/${id}/posts`,
        description: `掘金专栏-${username}`,
        item: resultItems,
    };
}
