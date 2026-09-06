import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/gsgg',
    categories: ['university'],
    example: '/zjgsu/gsgg',
    name: '教务处 - 公示公告',
    maintainers: ['nicolaszf'],
    handler,
    url: 'jww.zjgsu.edu.cn/1380/list.htm',
};

const host = 'https://jww.zjgsu.edu.cn';
const link = `${host}/1380/list.htm`;

async function handler() {
    const response = await ofetch(link);
    const $ = load(response);

    return {
        title: '浙江工商大学教务处 - 公示公告',
        link,
        item: $('li.column-news-item')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('a');

                return {
                    title: a.text(),
                    link: new URL(a.attr('href')!, host).href,
                    pubDate: timezone(parseDate($item.find('.column-news-date').text()), 8),
                };
            }),
    };
}
