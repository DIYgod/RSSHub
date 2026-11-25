import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/weixin/miniprogram/framework',
    categories: ['programming'],
    example: '/qq/weixin/miniprogram/framework',
    name: '基础库更新日志',
    maintainers: ['magicLaLa', 'nczitzk'],
    handler,
};

async function handler() {
    const link = 'https://developers.weixin.qq.com/miniprogram/dev/framework/release/';
    const response = await ofetch(link);
    const $ = load(response);
    const name = $('#docContent .content h1').find('a.header-anchor').remove().end().text();

    const items = $('#docContent .content h2')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const anchor = $item.find('a.header-anchor');
            anchor.remove();
            const title = $item.text();
            const date = /\d{4}[.-]\d{2}[.-]\d{2}/.exec(title)?.[0];
            return {
                title,
                description: $item
                    .nextUntil('h2')
                    .toArray()
                    .map((element) => $.html(element))
                    .join(''),
                pubDate: date ? parseDate(date.replaceAll('.', '-'), 8) : undefined,
                link: $item.attr('id') ? `${link}#${$item.attr('id')}` : link,
            };
        })
        .filter((item) => item.link !== link);

    return {
        title: name,
        link,
        item: items,
        description: name,
    };
}
