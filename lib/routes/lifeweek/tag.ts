import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { getRssItem } from './utils';

const rootApiUrl = 'https://www.lifeweek.com.cn/api/userWebFollow/getFollowTagContentList?type=4&sort=2&tagId';
const rootUrl = 'https://www.lifeweek.com.cn/articleList';
const articleRootUrl = 'https://www.lifeweek.com.cn/article';

export const route: Route = {
    path: '/tag/:id',
    categories: ['traditional-media'],
    example: '/lifeweek/tag/122',
    parameters: { id: '标签 ID' },
    description: `提取文章全文，获得更好的阅读体验。支持所有标签，标签名称见 [全部标签](https://www.lifeweek.com.cn/classify?type=1)。例如 [社会调查标签](https://www.lifeweek.com.cn/articleList/122) URL 最后的数字为标签 ID

| 社会调查 | 社会 | 经济 | 理财 | 热点 |
| -------- | ---- | ---- | ---- | ---- |
| 122      | 21   | 73   | 74   | 123  |`,
    radar: [
        {
            source: ['lifeweek.com.cn/articleList/:tag'],
            target: '/tag/:tag',
        },
    ],
    name: '标签',
    maintainers: ['changren-wcr'],
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
