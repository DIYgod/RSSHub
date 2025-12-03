import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'http://www.tynu.edu.cn';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['tynu.edu.cn/index/tzgg.htm', 'tynu.edu.cn/index.htm', 'tynu.edu.cn/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['2PoL'],
    handler,
    url: 'tynu.edu.cn/index/tzgg.htm',
};

async function handler() {
    const link = `${baseUrl}/index/tzgg.htm`;
    const response = await got(link);
    const data = response.data;

    const $ = load(data);
    const list = $('.news_content_list')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3').text(),
                link: new URL(item.find($('a')).attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.content_list_time').text(), 'YYYYMM-DD'),
            };
        });

    await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.description = $('#vsb_content').html() + ($('.content ul').not('.btm-cate').html() || '');
                return item;
            })
        )
    );

    return {
        title: '太原师范学院通知公告',
        link,
        item: list,
    };
}
