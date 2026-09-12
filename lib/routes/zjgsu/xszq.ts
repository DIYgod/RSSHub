import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/xszq',
    categories: ['university'],
    example: '/zjgsu/xszq',
    radar: [
        {
            source: ['jww.zjgsu.edu.cn/1331/list.htm'],
        },
    ],
    name: '教务处 - 学生专区',
    maintainers: ['nicolaszf'],
    handler,
    url: 'jww.zjgsu.edu.cn/1331/list.htm',
};

const host = 'https://jww.zjgsu.edu.cn';
const link = `${host}/1331/list.htm`;

async function handler() {
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('li.column-news-item')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const a = $item.find('.column-news-title a');

            return {
                title: a.text().trim(),
                link: new URL(a.attr('href')!, host).href,
                pubDate: timezone(parseDate($item.find('.column-news-date').text()), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detail = await ofetch(item.link);
                const $detail = load(detail);
                item.description = $detail('.wp_articlecontent').html();
                return item;
            })
        )
    );

    return {
        title: '浙江工商大学教务处 - 学生专区',
        link,
        item: items,
    };
}
