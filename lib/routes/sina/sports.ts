import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import { parseArticle } from './utils';

export const route: Route = {
    path: '/sports/:type',
    name: '体育',
    categories: ['sport'],
    example: '/sina/sports/volley',
    parameters: { type: '运动类型，见下表' },
    description: `| 排球   | 游泳 | 乒乓球   | 羽毛球 | 台球    | 田径     | 体操  | 冰雪   | 射击 | 马术  | 拳击搏击 | UFC | 其他   |
| ------ | ---- | -------- | ------ | ------- | -------- | ----- | ------ | ---- | ----- | -------- | --- | ------ |
| volley | swim | pingpang | badmin | snooker | tianjing | ticao | winter | sh   | horse | kungfu   | ufc | others |`,
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    let currentUrl = `https://sports.sina.com.cn/others/${type}.shtml`;
    let query = 'ul.list2 li a';

    if (type === 'ufc') {
        currentUrl = 'http://roll.sports.sina.com.cn/s_ufc_all/index.shtml';
        query = '#d_list ul li span a';
    } else if (type === 'winter' || type === 'horse') {
        currentUrl = `https://sports.sina.com.cn/${type}/`;
        query = '[class^=news-list] .list li a';
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const list = $(query)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: $item.attr('href')!.replace('http://', 'https://'),
            };
        })
        // The same story can be listed in more than one block of the page
        .filter((item, index, items) => items.findIndex((candidate) => candidate.link === item.link) === index);

    const items = await Promise.all(list.map((item) => parseArticle(item)));

    return {
        title: `${$('title').text().split('_', 1)[0]} - 新浪体育`,
        description: $('meta[name="description"]').attr('content'),
        link: currentUrl,
        item: items,
    };
}
