import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { baseUrl, parseItem } from './utils';

export const route: Route = {
    path: '/reviews/:type?',
    categories: ['new-media'],
    example: '/dcfever/reviews/cameras',
    parameters: { type: '分類，預設為 `cameras`' },
    radar: [
        {
            source: ['dcfever.com/:type/reviews.php'],
            target: '/reviews/:type',
        },
    ],
    name: '測試報告',
    maintainers: ['TonyRL'],
    handler,
    description: `| 相機及鏡頭 | 手機平板 | 試車報告 |
| ---------- | -------- | -------- |
| cameras    | phones   | cars     |`,
};

async function handler(ctx) {
    const { type = 'cameras' } = ctx.req.param();

    const link = `${baseUrl}/${type}/reviews.php`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.col-md-left .title a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: new URL(item.attr('href'), link).href,
            };
        });

    const items = await Promise.all(list.map((item) => parseItem(item)));

    return {
        title: $('head title').text(),
        link,
        image: 'https://cdn10.dcfever.com/images/android_192.png',
        item: items,
    };
}
