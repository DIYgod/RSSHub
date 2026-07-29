import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { getRssItem } from './utils';

const rootApiUrl = 'https://www.lifeweek.com.cn/api/userWebFollow/getFollowTagContentList?type=3&sort=2&tagId';
const rootUrl = 'https://www.lifeweek.com.cn/column';
const articleRootUrl = 'https://www.lifeweek.com.cn/article';

export const route: Route = {
    path: '/channel/:id',
    categories: ['traditional-media'],
    example: '/lifeweek/channel/9',
    parameters: { id: '栏目 ID' },
    description: `提取文章全文，获得更好的阅读体验。支持所有频道，频道名称见 [杂志栏目](https://www.lifeweek.com.cn/classify?type=2)。例如 [调查栏目](https://www.lifeweek.com.cn/column/9) URL 最后的数字为栏目 ID

| 调查 | 热点 | 人物 | 社会 | 经济 | 文化 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 9    | 6    | 10   | 2    | 3    | 4    |`,
    radar: [
        {
            source: ['lifeweek.com.cn/column/:channel'],
            target: '/channel/:channel',
        },
    ],
    name: '栏目',
    maintainers: ['changren-wcr'],
    handler,
};

async function handler(ctx) {
    const channel = ctx.req.param('id');
    const url = `${rootApiUrl}=${channel}`;
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
        link: `${rootUrl}/${channel}`,
        item: items,
    };
}
