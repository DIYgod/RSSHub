import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/mtest',
    categories: ['new-media'],
    example: '/yidoutang/mtest',
    name: '众测',
    maintainers: ['sanmmm'],
    handler,
};

async function handler() {
    const url = 'http://www.yidoutang.com/mtest';
    const response = await ofetch(url);
    const $ = load(response);

    const items = $('.zc-bd .zc-bd-left > .clearfix > a')
        .toArray()
        .map((ele) => {
            const $item = $(ele);
            const thumbnail = $item.find('.top > img').attr('src');
            const deadline = $item.find('.top > .time').text();
            const otherInfoArr = $item.find('.bottom').text().trim().split('\n');

            return {
                title: otherInfoArr[0],
                link: $item.attr('href'),
                description: [deadline, ...otherInfoArr, `<img src="${thumbnail}"/>`].filter((str) => !!str.trim()).join('<br/>'),
            };
        });

    return {
        title: '一兜糖 - 众测',
        description: '一兜糖 - 众测',
        link: url,
        item: items,
    };
}
