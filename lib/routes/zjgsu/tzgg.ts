import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/tzgg',
    categories: ['university'],
    example: '/zjgsu/tzgg',
    name: '新闻网 - 通知公告',
    maintainers: ['nicolaszf'],
    handler,
};

const host = 'http://news.zjgsu.edu.cn';
const link = `${host}/18/`;

async function handler() {
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('ul.list-1 li')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, host).href,
                pubDate: timezone(parseDate($item.find('span.fr').text()), 8),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            if (!item.link.startsWith(`${host}/`)) {
                return item;
            }

            const detail = await cache.tryGet(item.link, async (): Promise<Pick<DataItem, 'description'>> => {
                const detail = await ofetch(item.link);
                const $detail = load(detail);
                return { description: $detail('#the_content').html() };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: '浙江工商大学新闻网-通知公告',
        link,
        description: '浙江工商大学新闻网-通知公告',
        item: items,
    };
}
