import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/guide',
    categories: ['new-media'],
    example: '/yidoutang/guide',
    name: '文章',
    maintainers: ['sanmmm'],
    handler,
};

async function handler() {
    const url = 'http://www.yidoutang.com/guide.html';
    const response = await ofetch(url);
    const $ = load(response);

    const items = $('.main .guide-items > .guide-item')
        .toArray()
        .map((ele) => {
            const $item = $(ele);
            const titleNode = $item.find('.title > a');
            const thumbnail = $item.find('a > img').attr('src');

            const infoNode = $item.find('.info');
            const desc = infoNode.find('.desc').text();

            return {
                title: titleNode.text(),
                link: titleNode.attr('href'),
                description: [`简介: ${desc}`, `<img src="${thumbnail}"/>`].join('<br/>'),
                author: infoNode.find('.user a').text(),
            };
        });

    return {
        title: '一兜糖 - 文章',
        description: '一兜糖 - 文章',
        link: url,
        item: items,
    };
}
