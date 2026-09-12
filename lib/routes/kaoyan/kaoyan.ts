import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/kaoyan',
    name: '考研帮调剂信息',
    maintainers: ['shengmaosu'],
    handler,
};

async function handler() {
    const link = 'https://tiaoji.kaoyan.com/xinxi/';
    const response = await ofetch(link);
    const $ = load(response);

    const items = $('.areaZslist li')
        .toArray()
        .slice(0, 10)
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('li a').text(),
                description: $item.find('li a').text(),
                link: $item.find('li a').attr('href'),
                pubDate: timezone(parseDate($item.find('em').text()), 8),
            };
        });

    return {
        title: '考研帮调剂信息',
        link,
        description: '考研帮调剂信息',
        item: items,
    };
}
