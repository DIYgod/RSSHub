import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/case/:type',
    categories: ['new-media'],
    example: '/yidoutang/case/hot',
    parameters: { type: '类型, 默认为`default`' },
    name: '全屋记',
    maintainers: ['sanmmm'],
    handler,
    description: `类型

| 默认    | 最热 | 最新 |
| ------- | ---- | ---- |
| default | hot  | new  |`,
};

const urlPathMap = {
    default: '',
    hot: '/0-2-0-0-0-0/',
    new: '/0-1-0-0-0-0/',
};

const typeLabelMap = {
    default: '默认',
    hot: '热门',
    new: '最新',
};

async function handler(ctx: Context) {
    const { type = 'default' } = ctx.req.param();

    const url = `http://www.yidoutang.com/case${urlPathMap[type]}`;
    const response = await ofetch(url);
    const $ = load(response);

    const items = $('.main .case-items > .case-item')
        .toArray()
        .map((ele) => {
            const $item = $(ele);
            const baseInfoNode = $item.find('.info > .text');
            const desc = baseInfoNode.find('.desc').text();
            const thumbnail = $item.find('.img-box img').attr('src');

            return {
                title: baseInfoNode.find('.title').text(),
                link: baseInfoNode.find('a').attr('href'),
                description: [`简介: ${desc}`, `<img src="${thumbnail}"/>`].join('<br/>'),
                author: $item.find('.user a').text(),
            };
        });

    const typeLabel = typeLabelMap[type];

    return {
        title: `一兜糖 - 全屋记 - ${typeLabel}`,
        description: `一兜糖 - 全屋记 - ${typeLabel}`,
        link: url,
        item: items,
    };
}
