import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseList, ProcessFeed } from './utils';
import { Article, AuthorUserInfo } from './types';

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

const getUserInfo = (data: AuthorUserInfo) => ({
    username: data.user_name,
    description: data.description,
    avatar: data.avatar_large,
});

async function handler(ctx) {
    const id = ctx.req.param('id');

    const response = await ofetch('https://api.juejin.cn/content_api/v1/article/query_list', {
        method: 'POST',
        body: {
            user_id: id,
            sort_type: 2,
        },
    });
    const data = response.data as Article[];
    const list = parseList(data);
    const authorInfo = getUserInfo(data[0].author_user_info);
    const resultItems = await ProcessFeed(list);

    return {
        title: `掘金专栏-${authorInfo.username}`,
        link: `https://juejin.cn/user/${id}/posts`,
        description: authorInfo.description,
        image: authorInfo.avatar,
        item: resultItems,
    };
}
