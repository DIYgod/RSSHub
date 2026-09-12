import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { parseContent } from './utils';

const base = 'https://piapro.jp';

const types = new Set(['music', 'illust', 'text']);

export const route: Route = {
    path: '/public/:type/:tag?/:category?',
    categories: ['social-media'],
    example: '/piapro/public/music/miku/2',
    parameters: {
        type: 'work type, can be `music`,`illust`,`text`',
        tag: '`tag` parameter in url',
        category: 'category ID, `categoryId` parameter in url',
    },
    name: 'Website latest works',
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx: Context) {
    const params = ctx.req.param();
    const type = types.has(params.type) ? params.type : 'music';
    const tag = params.tag ?? '';
    const category = params.category ?? '';

    const url = `${base}/${type}/?tag=${encodeURIComponent(tag)}&categoryId=${category}`;

    const listResponse = await ofetch(url);
    const $ = load(listResponse);

    const typeName = $('head title').text().split('|').pop();
    const tagName = $('.tmblist_sort_box').eq(0).find('.option_selected a').text();
    const categoryName = $('.tmblist_sort_box').eq(1).find('.option_selected a').text();

    const list = $('.tmblist_list li > a:first-child')
        .toArray()
        .map((item) => base + $(item).attr('href'));

    const items = await Promise.all(
        list.slice(0, 10).map((link) =>
            cache.tryGet(link, async () => {
                const response = await ofetch(link);
                return {
                    ...parseContent(response),
                    link,
                };
            })
        )
    );

    return {
        title: `piapro - ${typeName}${tag ? ' - ' + tagName : ''}${category ? ' - ' + categoryName : ''}`,
        link: url,
        item: items,
    };
}
