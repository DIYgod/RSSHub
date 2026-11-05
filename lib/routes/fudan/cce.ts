import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const host = 'https://cce.fudan.edu.cn';
const link = 'https://cce.fudan.edu.cn/14096/list.htm';

export const route: Route = {
    path: '/cce',
    categories: ['university'],
    example: '/fudan/cce',
    name: '成人夜大通知公告',
    maintainers: ['mrbruce516'],
    features: { antiCrawler: true },
    handler,
};

async function handler() {
    const response = await ofetch(link);

    const $ = load(response);

    const urlList = $('.Article_Title a')
        .toArray()
        .map((i) => host + $(i).attr('href'));

    const out = await Promise.all(
        urlList.map((itemUrl) =>
            cache.tryGet(itemUrl, async (): Promise<DataItem> => {
                const response = await ofetch(itemUrl);
                const $ = load(response);
                const targetDate = $('.arti_update')
                    .text()
                    .match(/(\d{4}-\d{2})-\d{2}/);

                return {
                    title: $('.arti_title').text(),
                    link: itemUrl,
                    description: $('.wp_articlecontent').html(),
                    pubDate: targetDate ? parseDate(`${targetDate[0]}T00:00:00Z`) : undefined,
                };
            })
        )
    );

    return {
        title: '复旦大学继续教育学院 - 通知公告',
        link,
        item: out,
    };
}
