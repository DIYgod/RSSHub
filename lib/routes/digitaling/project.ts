import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const categoryTitle = new Map([
    ['all', { name: '全部' }],
    ['weekly', { name: '每周项目精选' }],
    ['monthly', { name: '每月项目精选' }],
    ['international', { name: '海外项目精选' }],
    ['hot', { name: '近期热门项目' }],
    ['favorite', { name: '近期最多收藏' }],
]);

export const route: Route = {
    path: '/projects/:category',
    categories: ['new-media'],
    example: '/digitaling/projects/all',
    parameters: {
        category: '项目专题分类',
    },
    name: '项目专题',
    maintainers: ['occupy5'],
    description: `| 全部 | 每周项目精选 | 每月项目精选 | 海外项目精选  | 近期热门项目 | 近期最多收藏 |
| ---- | ------------ | ------------ | ------------- | ------------ | ------------ |
| all  | weekly       | monthly      | international | hot          | favorite     |`,
    handler,
};

async function handler(ctx: Context) {
    const { category } = ctx.req.param();
    const categoryInfo = categoryTitle.get(category);
    if (!categoryInfo) {
        throw new InvalidParameterError('Invalid project category. Use all, weekly, monthly, international, hot, or favorite.');
    }
    const link = `https://www.digitaling.com/projects/${category}`;
    const res = await ofetch(link);
    const $ = load(res);

    const title = categoryInfo.name;

    const list = $('#pro_list .works_title h3')
        .find('a')
        .toArray()
        .map((e) => $(e).attr('href')!);

    const out = await pMap(
        list,
        (itemUrl) =>
            cache.tryGet(itemUrl, async () => {
                const res = await ofetch(itemUrl);
                const $ = load(res);

                return {
                    title: $('.project_title h1').text(),
                    author: $('#avatar_by').parent().find('h3 a').text(),
                    link: itemUrl,
                    description: $('#article_con').html(),
                    pubDate: timezone(parseDate($('#edit_url').parent().children().last().text()), 8),
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: `数英网-项目专题-${title}`,
        link,
        item: out,
    };
}
