import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const categoryTitle = new Map([
    ['latest', { name: '最新文章', type: {} }],
    ['headline', { name: '头条', type: {} }],
    [
        'hot',
        {
            name: '热文',
            type: {
                views: '近期热门文章',
                collects: '近期最多收藏',
                zan: '近期最多赞',
            },
        },
    ],
    ['choice', { name: '精选', type: {} }],
]);

export const route: Route = {
    path: '/articles/:category/:subcate?',
    categories: ['new-media'],
    example: '/digitaling/articles/latest',
    parameters: {
        category: '文章专题分类',
        subcate: 'hot 分类下的子类',
    },
    name: '数英网文章专题',
    maintainers: ['occupy5'],
    description: `| 最新文章 | 头条     | 热文 | 精选   |
| -------- | -------- | ---- | ------ |
| latest   | headline | hot  | choice |

分类\`hot\`下的子类

| 近期热门文章 | 近期最多收藏 | 近期最多赞 |
| ------------ | ------------ | ---------- |
| views        | collects     | zan        |`,
    handler,
};

async function handler(ctx: Context) {
    let category = ctx.req.param('category') || 'latest';
    const subcate = ctx.req.param('subcate');

    let title = categoryTitle.get(category)!.name;
    if (category === 'latest') {
        category = '';
    }
    let link = `https://www.digitaling.com/articles/${category}/`;
    if (subcate) {
        link += subcate;
        title += '/' + categoryTitle.get(category)!.type[subcate];
    }

    const res = await ofetch(link);
    const $ = load(res);

    const list = $('.con_list li h3')
        .find('a')
        .toArray()
        .map((e) => $(e).attr('href')!);

    const out = await Promise.all(
        list.map((itemUrl) =>
            cache.tryGet(itemUrl, async () => {
                const res = await ofetch(itemUrl);
                const $ = load(res);

                return {
                    title: $('.article_title h1').text(),
                    author: $('#avatar_by').parent().find('h3 a').text(),
                    link: itemUrl,
                    description: $('#article_con').html(),
                    pubDate: parseDate($('#edit_url').parent().children().last().text()),
                };
            })
        )
    );

    return {
        title: `数英网-文章专题-${title}`,
        link,
        item: out,
    };
}
