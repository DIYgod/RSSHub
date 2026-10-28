import { load } from 'cheerio';
import { encodeXML } from 'entities';

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
            const thumbnail = getImageUrl($item.find('.top > img').attr('src'), url);
            const deadline = $item.find('.top > .time').text();
            const titleNode = $item.find('.bottom > h2');
            const title = titleNode.text();
            titleNode.remove();
            const otherInfoArr = $item.find('.bottom').text().trim().split('\n');

            return {
                title,
                link: $item.attr('href'),
                description: [...[deadline, ...otherInfoArr].filter((str) => str?.trim()).map((str) => encodeXML(str)), thumbnail ? `<img src="${encodeXML(thumbnail)}"/>` : undefined].filter(Boolean).join('<br/>'),
            };
        });

    return {
        title: '一兜糖 - 众测',
        description: '一兜糖 - 众测',
        link: url,
        item: items,
    };
}

function getImageUrl(value: string | undefined, baseUrl: string): string | undefined {
    if (typeof value !== 'string' || !value) {
        return;
    }
    try {
        const url = new URL(value, baseUrl);
        if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) {
            return url.href;
        }
    } catch {
        // Ignore unsupported source image URLs.
    }
    return;
}
