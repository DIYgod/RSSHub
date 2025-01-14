import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getArticle } from './utils';
import { parseDate } from '@/utils/parse-date';
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

const getUserInfo = (id: string, data: AuthorUserInfo) =>
    cache.tryGet(`juejin:user:${id}`, () =>
        Promise.resolve({
            username: data.user_name,
            description: data.description,
            avatar: data.avatar_large,
        })
    ) as Promise<{ username: string; description: string; avatar: string }>;

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
    const list = data.map((item) => {
        const isArticle = !!item.article_info;

        return {
            title: isArticle ? item.article_info.title : item.content_info.title,
            description: (isArticle ? item.article_info.brief_content : item.content_info.brief) || '无描述',
            pubDate: parseDate(isArticle ? item.article_info.ctime : item.content_info.ctime, 'X'),
            author: item.author_user_info.user_name,
            link: `https://juejin.cn${isArticle ? `/post/${item.article_id}` : `/news/${item.content_id}`}`,
            categories: [...new Set([item.category.category_name, ...item.tags.map((tag) => tag.tag_name)])],
        };
    });

    const authorInfo = await getUserInfo(id, data[0].author_user_info);

    // const resultItems = await util.ProcessFeed(data, cache);
    const resultItems = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                item.description = (await getArticle(item.link)) || item.description;

                return item;
            })
        )
    );

    return {
        title: `掘金专栏-${authorInfo.username}`,
        link: `https://juejin.cn/user/${id}/posts`,
        description: authorInfo.description,
        item: resultItems,
    };
}
