import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { fetchArticle } from './common';

const categoryMap = new Map([
    ['1', { ckey: 'finance_config_index', name: '财经号' }],
    ['2', { ckey: 'city_config_index', name: '城市号' }],
    ['3', { ckey: 'media_config_index', name: '媒体号' }],
]);

export const route: Route = {
    path: '/account/main/:id',
    parameters: { id: '分类 id，见下表，可在对应分类页 URL 中找到' },
    name: '界面号',
    example: '/jiemian/account/main/1',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    description: `| [财经号](https://www.jiemian.com/account/main/1.html) | [城市号](https://www.jiemian.com/account/main/2.html) | [媒体号](https://www.jiemian.com/account/main/3.html) |
| ----------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| 1                                                     | 2                                                     | 3                                                     |`,
};

async function handler(ctx: Context): Promise<Data> {
    const { id } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 10;

    const category = categoryMap.get(id);
    if (!category) {
        throw new InvalidParameterError('Invalid id');
    }

    const response = await ofetch<string>('https://papi.jiemian.com/page/api/officialAccount/get_index_lists', {
        query: {
            ckey: category.ckey,
            page: 1,
        },
    });

    const list = JSON.parse(response.slice(response.indexOf('(') + 1, response.lastIndexOf(')')))
        .result.slice(0, limit)
        .map((article) => ({
            title: article.title,
            description: article.summary,
            link: article.url,
            pubDate: parseDate(article.publish_time, 'X'),
            author: article.source_name,
            image: article.image,
        }));

    const items = await Promise.all(list.map((item) => fetchArticle(item)));

    return {
        title: `界面新闻 - ${category.name}`,
        link: `https://www.jiemian.com/account/main/${id}.html`,
        item: items,
    };
}
