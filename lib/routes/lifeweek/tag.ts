import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import getRssItem from './utils';

const rootApiUrl = 'https://www.lifeweek.com.cn/api/userWebFollow/getFollowTagContentList?type=4&sort=2&tagId';
const rootUrl = 'https://www.lifeweek.com.cn/articleList';
const articleRootUrl = 'https://www.lifeweek.com.cn/article';

export const route: Route = {
    path: '/tag/:id',
    radar: [
        {
            source: ['lifeweek.com.cn/articleList/:tag'],
            target: '/tag/:tag',
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const tag = ctx.req.param('id');
    const url = `${rootApiUrl}=${tag}`;
    const { data } = await got(url);
    const result = data.model.articleResponseList;
    const items = await Promise.all(
        result.map((item) => {
            const articleLink = `${articleRootUrl}/${item.id}`;
            return cache.tryGet(articleLink, () => getRssItem(item, articleLink));
        })
    );

    return {
        title: data.model.tagName,
        link: `${rootUrl}/${tag}`,
        item: items,
    };
}
