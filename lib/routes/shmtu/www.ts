import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const host = 'https://www.shmtu.edu.cn';

async function loadContent(link) {
    const response = await got(link);
    const $ = load(response.data);

    return $('.wp_articlecontent').html();
}

const processFeed = (list: Array<DataItem & { link: string }>, caches: typeof cache) =>
    pMap(
        list,
        async (item) => {
            const details = await caches.tryGet(`shmtu:www:v2:${item.link}`, async () => {
                item.description = await loadContent(item.link);

                return { description: item.description };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

export const route: Route = {
    path: '/www/:type',
    categories: ['university'],
    example: '/shmtu/www/events',
    parameters: { type: '类型名称' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.shmtu.edu.cn/xsjz/list.htm', 'www.shmtu.edu.cn/events'],
            target: '/www/events',
        },
        {
            source: ['www.shmtu.edu.cn/12191/list.htm', 'www.shmtu.edu.cn/notes'],
            target: '/www/notes',
        },
    ],
    name: '官网信息',
    maintainers: ['imbytecat', 'simonsmh'],
    handler,
    description: `| 学术讲座 | 通知公告 |
| -------- | -------- |
| events   | notes    |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const info = type === 'notes' ? '通知公告' : '学术讲座';

    const currentUrl = `${host}/${type === 'notes' ? '12191' : 'xsjz'}/list.htm`;
    const response = await got(currentUrl, {
        headers: {
            Referer: host,
        },
    });

    const $ = load(response.data);
    const list = $('.tz-ul li')
        .toArray()
        .flatMap((item) => {
            const $item = $(item);
            const anchor = $item.find('a[href]');
            const href = anchor.attr('href');
            const title = anchor.attr('title') || $item.find('.tz-ul-tt').text();
            return href && title ? { title, link: new URL(href, host).href, pubDate: parseDateInTimezone($item.find('.one-center-bottom-date').text(), 8) } : [];
        });

    const result = await processFeed(list, cache);

    return {
        title: `上海海事大学 ${info}`,
        link: currentUrl,
        description: '上海海事大学 官网信息',
        item: result,
    };
}
