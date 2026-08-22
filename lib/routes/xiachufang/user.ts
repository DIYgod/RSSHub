import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';

import { fetchPage } from './utils';

export const route: Route = {
    path: '/user/:id/:type?',
    categories: ['study'],
    example: '/xiachufang/user/103309404',
    parameters: {
        id: '用户 id, 可在用户主页 URL 中找到',
        type: {
            description: '类型',
            options: [
                { value: 'created', label: '菜谱' },
                { value: 'cooked', label: '作品' },
            ],
            default: 'created',
        },
    },
    name: '用户菜谱/作品',
    maintainers: ['xyqfer'],
    handler,
};

async function handler(ctx: Context) {
    const { id, type = 'created' } = ctx.req.param();
    const url = `https://www.xiachufang.com/cook/${id}/`;
    const response = await fetchPage(url);

    const $ = load(response);
    const author = $('.page-title').text().trim();
    const selector = type === 'cooked' ? '.dishes-280-full-width-list' : '.recipes-280-full-width-list';

    const items = $(`${selector} li`)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('.name a');
            const title = $link.text();
            const img = $item.find('.cover img').attr('data-src')!.replace(/\?.+/, '');
            const desc = $item.find('.desc').text().trim() || $item.find('.stats').text().trim();

            return {
                title,
                link: `https://www.xiachufang.com${$link.attr('href')}`,
                description: `<img src="${img}"><br>${desc}`,
            };
        });

    return {
        title: `下厨房-${author}`,
        description: $('.people-base-desc').text().trim(),
        link: url,
        image: $('.people-base-left.avatar img').attr('src'),
        item: items,
    };
}
