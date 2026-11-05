import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/onehu',
    name: '首页',
    maintainers: ['ruoshui9527'],
    handler,
};

async function handler() {
    const link = 'https://onehu.xyz';
    const response = await got(link);
    const data = response.data;
    const $ = load(data);
    const list = $('#board article')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const date = $item.find('.post-meta.mr-3').children('time').attr('datetime');
            return {
                title: $item.find('.index-header').text(),
                link: $item.find('.index-header').children('a').attr('href'),
                description: $item.find('.index-excerpt.index-excerpt__noimg').children('div').text(),
                pubDate: date ? timezone(parseDate(date, 'YYYY-MM-DD HH:mm'), 8) : undefined,
            };
        });

    return {
        title: $('title').text(),
        link,
        item: list,
    };
}
