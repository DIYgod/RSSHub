import { load } from 'cheerio';
import pMap from 'p-map';

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
                title: a.text(),
                link: new URL(a.attr('href')!, host).href,
                pubDate: timezone(parseDate($item.find('.column-news-date').text()), 8),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(item.link, async (): Promise<Pick<DataItem, 'description' | 'author'>> => {
                const detail = await ofetch(item.link);
                const $detail = load(detail);
                const author = $detail('.arti-metas span')
                    .toArray()
                    .map((span) => $detail(span).text().trim())
                    .find((text) => text.startsWith('作者：'))
                    ?.replace(/^作者：/, '')
                    .trim();
                return { description: $detail('.wp_articlecontent').html(), author: author || undefined };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: '浙江工商大学教务处 - 学生专区',
        link,
        item: items,
    };
}
